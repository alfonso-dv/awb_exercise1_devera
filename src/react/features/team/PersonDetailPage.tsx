import { Link, useParams } from "react-router";
import { Panel } from "../../shared/components/Panel.tsx";
import { useCaseDataFromLayout } from "../../shared/data/caseDataOutlet.ts";
import { TimelineEventList } from "../timeline/components/TimelineEventList.tsx";
import { applyTimelineFilters } from "../timeline/timelineQuery.ts";
import { PersonCard } from "./components/PersonCard.tsx";
import { countEvidenceByPerson } from "./teamStats.ts";

/** /team/people/:personId */
export function PersonDetailPage() {
  // Route params are always strings (or undefined) — nothing guarantees that
  // the id in the URL belongs to a real person, so we have to look it up.
  const { personId } = useParams<{ personId: string }>();
  const { people, evidence, timeline, locations } = useCaseDataFromLayout();

  const person = people.find((p) => p.id === personId);

  if (!person) {
    return (
      <Panel title="Person not found">
        <p>
          There is no team member with the id <code>{personId}</code>.
        </p>
        <Link to="/team/people">Back to all people</Link>
      </Panel>
    );
  }

  const evidenceCount =
    countEvidenceByPerson([person], evidence).get(person.id) ?? 0;
  const events = applyTimelineFilters(timeline, {
    order: "asc",
    person: person.id,
    location: "",
    type: ""
  });

  return (
    <div className="detail-stack">
      <p>
        <Link to="/team/people">&larr; All people</Link>
      </p>

      <PersonCard person={person} evidenceCount={evidenceCount} />

      <Panel title="Background">
        <p>{person.background}</p>
      </Panel>

      <Panel title={`Timeline events involving ${person.name}`}>
        <p>
          <Link to={`/timeline?person=${encodeURIComponent(person.id)}`}>
            Open these events in the Timeline view
          </Link>
        </p>
        <TimelineEventList
          events={events}
          people={people}
          locations={locations}
        />
      </Panel>
    </div>
  );
}
