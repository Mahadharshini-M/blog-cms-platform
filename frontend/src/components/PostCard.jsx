import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge.jsx";
import { readingTime } from "../utils/readingTime.js";
import { categoryColor } from "../utils/categoryColors.js";

function excerpt(markdown, length = 140) {
  const plain = markdown.replace(/[#*_`>-]/g, "").replace(/\s+/g, " ").trim();
  return plain.length > length ? `${plain.slice(0, length)}…` : plain;
}

export default function PostCard({ post, adminView = false, index = 0 }) {
  const linkTo = adminView ? `/admin/posts/${post.id}/edit` : `/posts/${post.slug}`;

  return (
    <article className="post-card" style={{ "--card-delay": `${index * 40}ms` }}>
      <div className="post-card-header">
        <h3>
          <Link to={adminView ? `/posts/${post.slug}` : linkTo}>{post.title}</Link>
        </h3>
        {adminView && <StatusBadge status={post.status} />}
      </div>
      <p className="post-meta">
        <span
          className="category-dot"
          style={{ background: categoryColor(post.category) }}
        />
        {post.category} · By {post.author} ·{" "}
        {new Date(post.published_date || post.created_date).toLocaleDateString()} ·{" "}
        {readingTime(post.content)}
      </p>
      <p className="post-excerpt">{excerpt(post.content)}</p>
      <div className="post-tags">
        {(post.tags || []).map((tag) => (
          <span key={tag} className="tag">
            #{tag}
          </span>
        ))}
      </div>
      {adminView && (
        <div className="post-card-actions">
          <Link to={`/admin/posts/${post.id}/edit`} className="btn btn-small">
          Edit Article
          </Link>
        </div>
      )}
    </article>
  );
}
