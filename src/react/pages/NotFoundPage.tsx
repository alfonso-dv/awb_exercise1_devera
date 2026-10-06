import { navigate } from "../routing/useHashRoute.ts";

interface NotFoundPageProps {
  requested: string;
}

export function NotFoundPage({ requested }: NotFoundPageProps) {
  return (
    <section className="view active">
      <h2>View not found</h2>
      <div className="dashboard-panel">
        <p>
          There is no view called <code>{requested}</code>.
        </p>
        <button
          type="button"
          className="btn btn-primary btn-small"
          onClick={() => navigate("dashboard")}
        >
          Go to the Dashboard
        </button>
      </div>
    </section>
  );
}
