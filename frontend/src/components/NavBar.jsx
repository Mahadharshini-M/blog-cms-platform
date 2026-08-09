import { NavLink } from "react-router-dom";

export default function NavBar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand">
          The Daily Brief
        </NavLink>
        <nav>
          <NavLink to="/" end>
            Articles
          </NavLink>
          <NavLink to="/admin">Dashboard</NavLink>
          <NavLink to="/admin/posts/new" className="btn btn-small">
            New Article
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
