import type { Evidence, Person, PersonId } from "../../../types.ts";
import { evidenceMentionsPerson } from "../../../utils.ts";

/** Pure function: how many evidence items mention each person. */
export function countEvidenceByPerson(
  people: readonly Person[],
  evidence: readonly Evidence[]
): Map<PersonId, number> {
  return new Map(
    people.map((person) => [
      person.id,
      evidence.filter((ev) => evidenceMentionsPerson(ev, person)).length
    ])
  );
}
