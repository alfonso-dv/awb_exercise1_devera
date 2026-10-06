import type { ViewName } from "../../state.ts";

interface PlaceholderPageProps {
  title: string;
  /** Same view in the vanilla app, which still has the real implementation. */
  view: ViewName;
}

/** Stub for views that are migrated in Exercises 4 and 5. */
export function PlaceholderPage({ title, view }: PlaceholderPageProps) {
  return (
    <section className="view active">
      <h2>{title}</h2>
      <div className="dashboard-panel">
        <p>This view hasn't been migrated to React yet.</p>
        <p>
          Use the{" "}
          <a href={`index.html#${view}`}>vanilla version of this view</a> in the
          meantime.
        </p>
      </div>
    </section>
  );
}
