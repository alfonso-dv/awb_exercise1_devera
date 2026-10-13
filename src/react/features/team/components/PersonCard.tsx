import type { Person } from "../../../../types.ts";
import { BulletList } from "../../../shared/components/BulletList.tsx";

interface PersonCardProps {
  person: Person;
  /** Number of evidence items that mention this person (computed by the caller). */
  evidenceCount: number;
}

/**
 * Presentational: shows one person. It doesn't know where the data comes from
 * or how the evidence count is worked out — it only displays what it's given.
 */
export function PersonCard({ person, evidenceCount }: PersonCardProps) {
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
