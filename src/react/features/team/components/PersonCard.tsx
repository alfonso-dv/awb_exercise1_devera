import type { Evidence, Person } from "../../../../types.ts";
import { evidenceMentionsPerson } from "../../../../utils.ts";
import { BulletList } from "../../../shared/components/BulletList.tsx";

interface PersonCardProps {
  person: Person;
  /** All evidence items — the card counts the ones that mention this person. */
  allEvidence: Evidence[];
}

export function PersonCard({ person, allEvidence }: PersonCardProps) {
  const evidenceCount = allEvidence.filter((ev) =>
    evidenceMentionsPerson(ev, person)
  ).length;

  return (
    <div className="person-card">
      <div className="person-card-header">
        <img
          className="person-avatar"
          src={person.avatar}
          alt={`Portrait of ${person.name}`}
        />
        <div>
          <h3>{person.name}</h3>
          <div className="person-role">{person.role}</div>
        </div>
      </div>

      <p>
        <strong>Speciality:</strong> {person.speciality}
      </p>

      <BulletList items={person.responsibilities} />

      <div className="person-statement">&ldquo;{person.statement}&rdquo;</div>

      <p>
        {evidenceCount} related evidence item{evidenceCount === 1 ? "" : "s"}
      </p>
    </div>
  );
}
