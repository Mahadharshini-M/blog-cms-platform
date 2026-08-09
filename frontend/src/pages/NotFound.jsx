import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="page state-banner state-empty">
      <p>The page you requested could not be found.</p>
      <Link to="/">Return to Home</Link>
    </div>
  );
}
