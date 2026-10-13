import type { CaseLocation } from "../../../../types.ts";
import { BulletList } from "../../../shared/components/BulletList.tsx";

interface LocationCardProps {
  location: CaseLocation;
}

export function LocationCard({ location }: LocationCardProps) {
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
    </div>
  );
}
