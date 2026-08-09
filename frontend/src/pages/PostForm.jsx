import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { fetchPost, createPost, updatePost } from "../api/posts.js";
import { LoadingState, ErrorState } from "../components/StateBanners.jsx";

const emptyForm = {
  title: "",
  slug: "",
  content: "",
  author: "",
  category: "",
  tagsInput: "",
  image_url: "",
  status: "Draft",
};

export default function PostForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loadState, setLoadState] = useState(isEditing ? "loading" : "success");
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    let cancelled = false;

    fetchPost(id, { admin: true })
      .then((post) => {
        if (cancelled) return;
        setForm({
          title: post.title,
          slug: post.slug,
          content: post.content,
          author: post.author,
          category: post.category,
          tagsInput: (post.tags || []).join(", "),
          image_url: post.image_url || "",
          status: post.status,
        });
        setLoadState("success");
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMessage(err.message);
        setLoadState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [id, isEditing]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e, statusOverride) {
    e.preventDefault();
    setValidationErrors([]);
    setSaving(true);

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      content: form.content,
      author: form.author.trim(),
      category: form.category.trim(),
      tags: form.tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      image_url: form.image_url.trim() || undefined,
      status: statusOverride || form.status,
    };

    try {
      const saved = isEditing ? await updatePost(id, payload) : await createPost(payload);
      navigate(`/admin`, { state: { savedId: saved.id } });
    } catch (err) {
      setValidationErrors(err.details || [err.message]);
    } finally {
      setSaving(false);
    }
  }

  if (loadState === "loading") return <LoadingState label="Retrieving article…" />;
  if (loadState === "error") return <ErrorState message={errorMessage} />;

  return (
    <div className="page">
      <Link to="/admin" className="back-link">
        ‹ Back to Dashboard
      </Link>
      <h1>{isEditing ? "Edit Article" : "New Article"}</h1>

      {validationErrors.length > 0 && (
        <div className="state-banner state-error">
          <ul>
            {validationErrors.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      <form className="post-form" onSubmit={(e) => handleSubmit(e)}>
        <label>
          Title
          <input
            required
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
          />
        </label>

        <label>
          Slug <span className="hint">(optional — auto-generated from title if left blank)</span>
          <input
            value={form.slug}
            onChange={(e) => updateField("slug", e.target.value)}
            placeholder="e.g. my-article-title"
          />
        </label>

        <div className="form-row">
          <label>
            Author
            <input
              required
              value={form.author}
              onChange={(e) => updateField("author", e.target.value)}
            />
          </label>
          <label>
            Category
            <input
              required
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              placeholder="e.g. Technology"
            />
          </label>
        </div>

        <label>
          Tags <span className="hint">(comma-separated)</span>
          <input
            value={form.tagsInput}
            onChange={(e) => updateField("tagsInput", e.target.value)}
            placeholder="e.g. guide, tips, react"
          />
        </label>

        <label>
          Cover Image URL <span className="hint">(optional — a placeholder image is used if left blank)</span>
          <input
            type="url"
            value={form.image_url}
            onChange={(e) => updateField("image_url", e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </label>

        <label className="editor-label-row">
          <span>
            Content <span className="hint">(Markdown formatting supported)</span>
          </span>
          <button
            type="button"
            className="btn btn-small"
            onClick={() => setShowPreview((v) => !v)}
          >
            {showPreview ? "Back to Editor" : "Preview"}
          </button>
        </label>

        {showPreview ? (
          <div className="markdown-body markdown-preview">
            <ReactMarkdown>{form.content || "*No content to preview.*"}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            required
            rows={14}
            value={form.content}
            onChange={(e) => updateField("content", e.target.value)}
            placeholder="## Begin writing your article in Markdown…"
          />
        )}

        <label>
          Status
          <select value={form.status} onChange={(e) => updateField("status", e.target.value)}>
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
          </select>
        </label>

        <div className="form-actions">
          <button type="submit" className="btn" disabled={saving}>
            {saving ? "Saving…" : "Save Article"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={saving}
            onClick={(e) =>
              handleSubmit(e, form.status === "Published" ? "Draft" : "Published")
            }
          >
            {form.status === "Published" ? "Save as Draft" : "Save & Publish"}
          </button>
        </div>
      </form>
    </div>
  );
}
