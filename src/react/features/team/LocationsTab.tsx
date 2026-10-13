import { EmptyState } from "../../shared/components/EmptyState.tsx";
import { useCaseDataFromLayout } from "../../shared/data/caseDataOutlet.ts";
import { LocationCard } from "./components/LocationCard.tsx";

/** /team/locations */
export function LocationsTab() {
  const { locations } = useCaseDataFromLayout();

  if (locations.length === 0) {
    return <EmptyState>No locations are recorded for this case.</EmptyState>;
  }

  return (
    <div className="locations-grid">
      {locations.map((location) => (
        <LocationCard key={location.id} location={location} showDetailLink />
      ))}
    </div>
  );
}
