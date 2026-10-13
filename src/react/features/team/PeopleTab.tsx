import { EmptyState } from "../../shared/components/EmptyState.tsx";
import { useCaseDataFromLayout } from "../../shared/data/caseDataOutlet.ts";
import { PersonCard } from "./components/PersonCard.tsx";
import { countEvidenceByPerson } from "./teamStats.ts";

/**
 * /team/people — feature component: gets the data, derives what the cards
 * need, and decides what to show. The cards themselves only display.
 */
export function PeopleTab() {
  const { people, evidence } = useCaseDataFromLayout();
  const evidenceCounts = countEvidenceByPerson(people, evidence);

  if (people.length === 0) {
    return <EmptyState>No people are recorded for this case.</EmptyState>;
  }

  return (
    <div className="people-grid">
      {people.map((person) => (
        <PersonCard
          key={person.id}
          person={person}
          evidenceCount={evidenceCounts.get(person.id) ?? 0}
          showProfileLink
        />
      ))}
    </div>
  );
}
