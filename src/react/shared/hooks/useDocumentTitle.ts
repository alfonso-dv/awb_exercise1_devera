import { useEffect } from "react";

const APP_NAME = "Project ReMotion";

/**
 * Keeps the browser tab title in sync with the current view.
 *
 * A legitimate effect: document.title lives OUTSIDE React (it's not part of
 * the JSX we return), so changing it is a side effect and must not happen
 * during render. Runs after the page is shown, and again only when `title`
 * changes.
 */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} – ${APP_NAME}`;
  }, [title]);
}
