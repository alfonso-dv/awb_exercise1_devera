import { EmptyState } from "../../shared/components/EmptyState.tsx";
import { useCaseDataFromLayout } from "../../shared/data/caseDataOutlet.ts";
import { PersonCard } from "./components/PersonCard.tsx";

/** /team/people */
export function PeopleTab() {
  const { people, evidence } = useCaseDataFromLayout();

  if (people.length === 0) {
    return <EmptyState>No people are recorded for this case.</EmptyState>;
  }

  return (
    <div className="people-grid">
      {people.map((person) => (
        <PersonCard key={person.id} person={person} allEvidence={evidence} />
      ))}
    </div>
  );
}
