interface BulletListProps {
  items: readonly string[];
}

/** A plain <ul> of strings. Renders nothing at all for an empty list. */
export function BulletList({ items }: BulletListProps) {
  // Early return: no empty <ul></ul> left in the page (it would still take up
  // margin space and be announced as an empty list).
  if (items.length === 0) return null;

  return (
    <ul>
      {items.map((item) => (
        // The strings themselves are the keys: within one list they're
        // unique, and they don't change while the list is shown.
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
