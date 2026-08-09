import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCategories } from "../api/posts.js";
import { usePosts } from "../hooks/usePosts.js";
import PostCard from "../components/PostCard.jsx";
import Pagination from "../components/Pagination.jsx";
import { LoadingState, ErrorState, EmptyState } from "../components/StateBanners.jsx";
import { readingTime } from "../utils/readingTime.js";
import { postImage } from "../utils/postImage.js";

function excerpt(markdown, length = 260) {
  const plain = markdown.replace(/[#*_`>]/g, "").replace(/-/g, " ").replace(/\s+/g, " ").trim();
  return plain.length > length ? `${plain.slice(0, length)}…` : plain;
}

const PAGE_SIZE = 6;

export default function PublicPostList() {
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => { setPage(1); }, [searchInput, category, sort]);

  const { posts, pagination, status, errorMessage, reload } = usePosts({
    search: searchInput,
    category,
    sort,
    page,
    limit: PAGE_SIZE,
  });

  return (
    <div className="page">
      <h1>Articles</h1>

      <div className="filters">
        <input
          type="search"
          placeholder="Search articles by title or content…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="title">Title (A–Z)</option>
        </select>
      </div>

      {status === "loading" && <LoadingState />}
      {status === "error" && <ErrorState message={errorMessage} onRetry={reload} />}
      {status === "success" && posts.length === 0 && (
        <EmptyState message="No published articles match the selected filters." />
      )}

      {status === "success" && posts.length > 0 && (() => {
        const showFeatured = sort === "newest" && page === 1;
        const featured = showFeatured ? posts[0] : null;
        const gridPosts = showFeatured ? posts.slice(1) : posts;
        return (
          <>
            {featured && (
              <article className="featured-card">
                <img
                  className="featured-card-image"
                  src={postImage(featured)}
                  alt={featured.title}
                />
                <div className="featured-card-body">
                <p className="post-meta">
                  By {featured.author} ·{" "}
                  {featured.category} ·{" "}
                  {new Date(featured.published_date || featured.created_date).toLocaleDateString()} ·{" "}
                  {readingTime(featured.content)}
                </p>
                <h2>
                  <Link to={`/posts/${featured.slug}`}>{featured.title}</Link>
                </h2>
                <p className="featured-excerpt">{excerpt(featured.content)}</p>
                <div className="post-tags">
                  {(featured.tags || []).map((tag) => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
                </div>
              </article>
            )}
            {gridPosts.length > 0 && (
              <div className="post-grid">
                {gridPosts.map((post, i) => (
                  <PostCard key={post.id} post={post} index={i} />
                ))}
              </div>
            )}
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onChange={setPage}
            />
          </>
        );
      })()}
    </div>
  );
}
