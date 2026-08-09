const db = require("../db");
const slugify = require("slugify");

function serializePost(row) {
  if (!row) return null;
  return {
    ...row,
    tags: (() => {
      try {
        return JSON.parse(row.tags || "[]");
      } catch {
        return [];
      }
    })(),
  };
}

function isAdminRequest(req) {
  // Simple mechanism for this assessment: an admin/author view is signalled
  // via a header or query flag. Only these requests can see Draft posts.
  return req.headers["x-admin"] === "true" || req.query.admin === "true";
}

// GET /posts
function getPosts(req, res, next) {
  try {
    const admin = isAdminRequest(req);
    const {
      search = "",
      category = "",
      status = "",
      page = "1",
      limit = "10",
      sort = "newest",
    } = req.query;

    const ORDER_BY = {
      newest: "created_date DESC",
      oldest: "created_date ASC",
      title:  "title ASC",
    };
    const orderBy = ORDER_BY[sort] ?? ORDER_BY.newest;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = {};

    if (!admin) {
      conditions.push("status = 'Published'");
    } else if (status) {
      if (!["Draft", "Published"].includes(status)) {
        return res.status(400).json({ error: "status must be 'Draft' or 'Published'" });
      }
      conditions.push("status = @status");
      params.status = status;
    }

    if (category) {
      conditions.push("category = @category");
      params.category = category;
    }

    if (search) {
      conditions.push("(title LIKE @search OR content LIKE @search)");
      params.search = `%${search}%`;
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const total = db
      .prepare(`SELECT COUNT(*) AS count FROM posts ${whereClause}`)
      .get(params).count;

    const rows = db
      .prepare(
        `SELECT * FROM posts ${whereClause} ORDER BY ${orderBy} LIMIT @limit OFFSET @offset`
      )
      .all({ ...params, limit: limitNum, offset });

    res.json({
      data: rows.map(serializePost),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /posts/:idOrSlug
function getPost(req, res, next) {
  try {
    const admin = isAdminRequest(req);
    const { idOrSlug } = req.params;
    const isNumeric = /^\d+$/.test(idOrSlug);

    const row = isNumeric
      ? db.prepare("SELECT * FROM posts WHERE id = ?").get(idOrSlug)
      : db.prepare("SELECT * FROM posts WHERE slug = ?").get(idOrSlug);

    if (!row) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (!admin && row.status !== "Published") {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json(serializePost(row));
  } catch (err) {
    next(err);
  }
}

function validatePostBody(body, { partial = false } = {}) {
  const errors = [];
  const required = ["title", "content", "author", "category"];

  if (!partial) {
    for (const field of required) {
      if (!body[field] || String(body[field]).trim() === "") {
        errors.push(`${field} is required`);
      }
    }
  }

  if (body.status && !["Draft", "Published"].includes(body.status)) {
    errors.push("status must be 'Draft' or 'Published'");
  }

  if (body.tags && !Array.isArray(body.tags)) {
    errors.push("tags must be an array of strings");
  }

  return errors;
}

// POST /posts
function createPost(req, res, next) {
  try {
    const errors = validatePostBody(req.body);
    if (errors.length) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }

    const { title, content, author, category, tags = [], status = "Draft" } = req.body;

    let slug = req.body.slug
      ? slugify(req.body.slug, { lower: true, strict: true })
      : slugify(title, { lower: true, strict: true });

    const existing = db.prepare("SELECT id FROM posts WHERE slug = ?").get(slug);
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const now = new Date().toISOString();
    const publishedDate = status === "Published" ? now : null;

    const result = db
      .prepare(
        `INSERT INTO posts (title, slug, content, author, category, tags, status, created_date, published_date)
         VALUES (@title, @slug, @content, @author, @category, @tags, @status, @created_date, @published_date)`
      )
      .run({
        title,
        slug,
        content,
        author,
        category,
        tags: JSON.stringify(tags),
        status,
        created_date: now,
        published_date: publishedDate,
      });

    const created = db.prepare("SELECT * FROM posts WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json(serializePost(created));
  } catch (err) {
    next(err);
  }
}

// PUT /posts/:id
function updatePost(req, res, next) {
  try {
    const { id } = req.params;
    const existing = db.prepare("SELECT * FROM posts WHERE id = ?").get(id);
    if (!existing) {
      return res.status(404).json({ error: "Post not found" });
    }

    const errors = validatePostBody(req.body, { partial: true });
    if (errors.length) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }

    const updated = {
      title: req.body.title ?? existing.title,
      content: req.body.content ?? existing.content,
      author: req.body.author ?? existing.author,
      category: req.body.category ?? existing.category,
      tags: JSON.stringify(req.body.tags ?? JSON.parse(existing.tags || "[]")),
      status: req.body.status ?? existing.status,
    };

    let slug = existing.slug;
    if (req.body.title && req.body.title !== existing.title && !req.body.slug) {
      slug = slugify(req.body.title, { lower: true, strict: true });
    }
    if (req.body.slug) {
      slug = slugify(req.body.slug, { lower: true, strict: true });
    }
    if (slug !== existing.slug) {
      const clash = db
        .prepare("SELECT id FROM posts WHERE slug = ? AND id != ?")
        .get(slug, id);
      if (clash) slug = `${slug}-${Date.now()}`;
    }

    let publishedDate = existing.published_date;
    if (updated.status === "Published" && existing.status !== "Published") {
      publishedDate = new Date().toISOString();
    }
    if (updated.status === "Draft") {
      publishedDate = existing.published_date; // keep history, just not "live"
    }

    db.prepare(
      `UPDATE posts SET title=@title, slug=@slug, content=@content, author=@author,
       category=@category, tags=@tags, status=@status, published_date=@published_date
       WHERE id=@id`
    ).run({ ...updated, slug, published_date: publishedDate, id });

    const row = db.prepare("SELECT * FROM posts WHERE id = ?").get(id);
    res.json(serializePost(row));
  } catch (err) {
    next(err);
  }
}

// DELETE /posts/:id
function deletePost(req, res, next) {
  try {
    const { id } = req.params;
    const existing = db.prepare("SELECT id FROM posts WHERE id = ?").get(id);
    if (!existing) {
      return res.status(404).json({ error: "Post not found" });
    }
    db.prepare("DELETE FROM posts WHERE id = ?").run(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// GET /categories - convenience endpoint used by the frontend filter dropdown
function getCategories(req, res, next) {
  try {
    const rows = db
      .prepare("SELECT DISTINCT category FROM posts ORDER BY category ASC")
      .all();
    res.json(rows.map((r) => r.category));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getCategories,
};
