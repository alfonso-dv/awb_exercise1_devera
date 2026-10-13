import { Link, useSearchParams } from "react-router";
import { Panel } from "../shared/components/Panel.tsx";
import { useCaseDataFromLayout } from "../shared/data/caseDataOutlet.ts";

/**
 * Exercise 4, Demo 4 — throwaway demo of why key={index} is wrong for lists
 * that reorder or filter. Route: #/sandbox/keys (not in the navigation).
 *
 * Each row has an *uncontrolled* <input>: its typed text lives in the DOM
 * node, not in React data. React decides which DOM node belongs to which row
 * by the row's key. Everything is driven by the URL (links), no useState:
 *   ?keys=index|id        which key to use
 *   ?order=reversed       reverse the list
 *   ?without=<personId>   remove one person from the list (a filter)
 */
export function KeyIdentityDemo() {
  const { people } = useCaseDataFromLayout();
  const [params] = useSearchParams();

  const keyMode = params.get("keys") === "id" ? "id" : "index";
  const reversed = params.get("order") === "reversed";
  const without = params.get("without") ?? "";

  let rows = people.filter((p) => p.id !== without);
  if (reversed) rows = [...rows].reverse();

  // Builds a link that keeps the other settings and changes one.
  function href(changes: Record<string, string | null>): string {
    const next = new URLSearchParams(params);
    for (const [name, value] of Object.entries(changes)) {
      if (value === null) next.delete(name);
      else next.set(name, value);
    }
    return `/sandbox/keys?${next.toString()}`;
  }

  return (
    <section className="view active">
      <h2>Sandbox: list keys and identity</h2>

      <Panel title="How to use">
        <ol>
          <li>Type something into Nova Byte&apos;s note field.</li>
          <li>
            Click &ldquo;Reverse order&rdquo; or &ldquo;Remove first
            person&rdquo;.
          </li>
          <li>
            With <strong>index keys</strong> the text stays in the same position
            and now sits next to someone else. With <strong>id keys</strong> it
            moves with Nova Byte.
          </li>
        </ol>
        <p>
          Currently using:{" "}
          <strong>
            {keyMode === "index" ? "key={index} ❌" : "key={person.id} ✅"}
          </strong>
        </p>
        <p>
          <Link
            className="btn btn-secondary btn-small"
            to={href({ order: reversed ? null : "reversed" })}
          >
            {reversed ? "Original order" : "Reverse order"}
          </Link>{" "}
          <Link
            className="btn btn-secondary btn-small"
            to={href({ without: without ? null : (people[0]?.id ?? null) })}
          >
            {without ? "Show everyone" : "Remove first person"}
          </Link>{" "}
          <Link
            className="btn btn-primary btn-small"
            to={href({
              keys: keyMode === "index" ? "id" : "index",
              order: null,
              without: null
            })}
          >
            Switch to {keyMode === "index" ? "id" : "index"} keys (and reset)
          </Link>
        </p>
      </Panel>

      <Panel title="People">
        {rows.map((person, index) => (
          <div
            // ↓ the point of this demo
            key={keyMode === "index" ? index : person.id}
            className="mini-list-item"
          >
            <strong>{person.name}</strong>{" "}
            <input type="text" placeholder={`Note about ${person.name}`} />
          </div>
        ))}
      </Panel>
    </section>
  );
}
