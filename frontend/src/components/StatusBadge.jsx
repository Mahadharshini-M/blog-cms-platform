export default function StatusBadge({ status }) {
  const isPublished = status === "Published";
  return (
    <span className={`badge ${isPublished ? "badge-published" : "badge-draft"}`}>
      {status}
    </span>
  );
}
