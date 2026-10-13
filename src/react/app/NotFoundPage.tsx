import { Link, useLocation } from "react-router";

/** Rendered by the catch-all route (path="*") for any unknown URL. */
export function NotFoundPage() {
  const { pathname } = useLocation();

  return (
    <section className="view active">
      <h2>Page not found</h2>
      <div className="dashboard-panel">
        <p>
          There is no page at <code>{pathname}</code>.
        </p>
        <Link to="/dashboard" className="btn btn-primary btn-small">
          Go to the Dashboard
        </Link>
      </div>
    </section>
  );
}
