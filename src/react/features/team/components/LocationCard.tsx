import { Link } from "react-router";
import type { CaseLocation } from "../../../../types.ts";
import { BulletList } from "../../../shared/components/BulletList.tsx";

interface LocationCardProps {
  location: CaseLocation;
  /** Show a link to the location's own page. */
  showDetailLink?: boolean;
}

export function LocationCard({
  location,
  showDetailLink = false
}: LocationCardProps) {
  return (
    <div className="location-card">
      <h3>
        {location.id} &mdash; {location.name}
      </h3>
      <p>{location.description}</p>
      <p>
        <strong>Contains:</strong>
      </p>
      <BulletList items={location.contains} />
      {showDetailLink && (
        <p>
          <Link to={`/team/locations/${encodeURIComponent(location.id)}`}>
            View events at this location &rarr;
          </Link>
        </p>
      )}
    </div>
  );
}
