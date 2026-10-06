// Demo 5: the smallest possible component — static data rendered with JSX.
// No props, no state: just a function that returns a description of UI.

const caseFile = {
  id: "REMOTION-2026-10",
  title: "Project ReMotion",
  people: ["Signal Scholar", "Kernel Colt", "Nova Byte"]
};

export function HelloCase() {
  return (
    <section className="dashboard-panel">
      <h3>
        {caseFile.title} <small>({caseFile.id})</small>
      </h3>
      <ul>
        {caseFile.people.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </section>
  );
}
