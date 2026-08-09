import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { fetchPost } from "../api/posts.js";
import StatusBadge from "../components/StatusBadge.jsx";
import { LoadingState, ErrorState } from "../components/StateBanners.jsx";
import { readingTime } from "../utils/readingTime.js";

export default function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    // admin: true so authors can preview drafts by slug too
    fetchPost(slug, { admin: true })
      .then((data) => {
        if (cancelled) return;
        setPost(data);
        setStatus("success");
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMessage(err.message);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (status === "loading") return <LoadingState label="Retrieving article…" />;
  if (status === "error") return <ErrorState message={errorMessage} />;
  if (!post) return null;

  return (
    <article className="page post-detail">
      <Link to="/" className="back-link">
        ‹ Back to Articles
      </Link>
      <div className="post-detail-header">
        <h1>{post.title}</h1>
        <StatusBadge status={post.status} />
      </div>
      <p className="post-meta">
        By {post.author} · {post.category} ·{" "}
        {new Date(post.published_date || post.created_date).toLocaleDateString()} ·{" "}
        {readingTime(post.content)}
      </p>
      <div className="post-tags">
        {(post.tags || []).map((tag) => (
          <span key={tag} className="tag">
            #{tag}
          </span>
        ))}
      </div>
      <div className="markdown-body">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
}
