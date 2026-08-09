import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCategories, deletePost } from "../api/posts.js";
import { usePosts } from "../hooks/usePosts.js";
import PostCard from "../components/PostCard.jsx";
import Pagination from "../components/Pagination.jsx";
import { LoadingState, ErrorState, EmptyState } from "../components/StateBanners.jsx";

const PAGE_SIZE = 8;

export default function AdminPostList() {
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => { setPage(1); }, [searchInput, category, statusFilter]);

  const { posts, pagination, status, errorMessage, reload } = usePosts({
    search: searchInput,
    category,
    status: statusFilter,
    page,
    limit: PAGE_SIZE,
    admin: true,
  });

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this article? This action cannot be undone.")) return;
    try {
      await deletePost(id);
      reload();
    } catch (err) {
      alert(`Failed to remove article: ${err.message}`);
    }
  }

  return (
    <div className="page">
      <div className="page-header-row">
        <h1>Dashboard · All Articles</h1>
        <Link to="/admin/posts/new" className="btn">
          New Article
        </Link>
      </div>

      <div className="filters">
        <input
          type="search"
          placeholder="Search articles…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
        </select>
      </div>

      {status === "loading" && <LoadingState />}
      {status === "error" && <ErrorState message={errorMessage} onRetry={reload} />}
      {status === "success" && posts.length === 0 && (
        <EmptyState message="No articles match the selected filters." />
      )}

      {status === "success" && posts.length > 0 && (
        <>
          <div className="post-grid">
            {posts.map((post, i) => (
              <div key={post.id} className="admin-post-wrapper">
                <PostCard post={post} adminView index={i} />
                <button className="btn btn-small btn-danger" onClick={() => handleDelete(post.id)}>
                  Remove Article
                </button>
              </div>
            ))}
          </div>
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
