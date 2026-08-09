import { Link, useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge.jsx";
import { readingTime } from "../utils/readingTime.js";
import { categoryColor } from "../utils/categoryColors.js";
import { postImage } from "../utils/postImage.js";

function excerpt(markdown, length = 140) {
  const plain = markdown.replace(/[#*_`>]/g, "").replace(/-/g, " ").replace(/\s+/g, " ").trim();
  return plain.length > length ? `${plain.slice(0, length)}…` : plain;
}

export default function PostCard({ post, adminView = false, index = 0 }) {
  const navigate = useNavigate();
  const linkTo = adminView ? `/posts/${post.slug}` : `/posts/${post.slug}`;
  const editTo = `/admin/posts/${post.id}/edit`;

  return (
    <article
      className="post-card"
      style={{ "--card-delay": `${index * 40}ms`, cursor: "pointer" }}
      onClick={() => navigate(linkTo)}
    >
      <img
        className="post-card-image"
        src={postImage(post, 400, 225)}
        alt={post.title}
        loading="lazy"
      />
      <div className="post-card-header">
        <h3>
          <Link to={linkTo} onClick={(e) => e.stopPropagation()}>{post.title}</Link>
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
          <Link
            to={editTo}
            className="btn btn-small"
            onClick={(e) => e.stopPropagation()}
          >
            Edit Article
          </Link>
        </div>
      )}
    </article>
  );
}
