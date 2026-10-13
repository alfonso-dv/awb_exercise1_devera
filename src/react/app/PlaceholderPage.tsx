interface PlaceholderPageProps {
  title: string;
  /** Hash of the same view in the vanilla app, which still implements it. */
  vanillaView: string;
}

/** Stub for views that are migrated in Exercise 5. */
export function PlaceholderPage({ title, vanillaView }: PlaceholderPageProps) {
  return (
    <section className="view active">
      <h2>{title}</h2>
      <div className="dashboard-panel">
        <p>This view hasn't been migrated to React yet.</p>
        <p>
          Use the{" "}
          <a href={`index.html#${vanillaView}`}>vanilla version of this view</a>{" "}
          in the meantime.
        </p>
      </div>
    </section>
  );
}
