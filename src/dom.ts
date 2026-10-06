// Typed DOM lookups.
//
// document.getElementById() returns `HTMLElement | null`: TypeScript can't
// know that an element with that id exists in index.html, nor that it is a
// <select> rather than a <div>. These helpers check both at runtime, so the
// rest of the code gets a precise type (e.g. HTMLSelectElement with .value)
// without `any` or `!` assertions.

type ElementType<T extends HTMLElement> = { new (): T; prototype: T };

/** Returns the element with this id, or null if missing / of another type. */
export function findElement<T extends HTMLElement>(
  id: string,
  type: ElementType<T>
): T | null {
  const el = document.getElementById(id);
  return el instanceof type ? el : null;
}

/** Like findElement(), but the element is required by the page markup. */
export function getElement<T extends HTMLElement>(
  id: string,
  type: ElementType<T>
): T {
  const el = findElement(id, type);

  if (!el) {
    throw new Error(`Element #${id} is missing or not a ${type.name}`);
  }

  return el;
}

/** Shorthand for a required <select>'s current value. */
export function selectValue(id: string): string {
  return getElement(id, HTMLSelectElement).value;
}
