import { useOutletContext } from "react-router";
import type { CaseData } from "./loadCaseData.ts";

/**
 * The case data is loaded once by <AppLayout /> and handed to every page
 * through React Router's <Outlet context={...} />. Pages call this hook to
 * read it, so they don't need it passed as a prop by hand.
 */
export function useCaseDataFromLayout(): CaseData {
  return useOutletContext<CaseData>();
}
