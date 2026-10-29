import { Link } from "@tanstack/react-router";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { PokemonImage } from "@/components/pokemon-image";
import { TypeBadge } from "@/components/type-badge";
import type { PokedexEntry } from "@/lib/pokedex";

/** Column counts by minimum viewport width, matching Tailwind's `sm` (40rem) and `md` (48rem). */
const BREAKPOINTS = [
  { query: "(min-width: 48rem)", columns: 4 },
  { query: "(min-width: 40rem)", columns: 3 },
];
const BASE_COLUMNS = 2;
/** Gap between cards in px; matches `gap-4`. */
const GAP = 16;
/** A card's typical height in px, before it's measured. */
const ESTIMATED_ROW_HEIGHT = 209;

/** Splits entries into grid rows of `columns` cards each. */
export function toRows<T>(items: T[], columns: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += columns) rows.push(items.slice(i, i + columns));
  return rows;
}

function currentColumns(): number {
  return BREAKPOINTS.find((b) => window.matchMedia(b.query).matches)?.columns ?? BASE_COLUMNS;
}

function subscribeToBreakpoints(onChange: () => void): () => void {
  const queries = BREAKPOINTS.map((b) => window.matchMedia(b.query));
  for (const q of queries) q.addEventListener("change", onChange);
  return () => {
    for (const q of queries) q.removeEventListener("change", onChange);
  };
}

/** The element's distance from the top of the document, kept current as content above it resizes. */
function useDocumentOffset(ref: React.RefObject<HTMLElement | null>): number {
  const [offset, setOffset] = useState(0);
  useLayoutEffect(() => {
    const measure = (): void => {
      const el = ref.current;
      if (el) setOffset(el.getBoundingClientRect().top + window.scrollY);
    };
    measure();
    // Anything above the grid changing height (e.g. Type filters loading) also resizes the body.
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, [ref]);
  return offset;
}

/**
 * The home page's grid of Pokédex entries. Only rows near the viewport are rendered,
 * because laying out all ~1025 cards at once is slow (notably in Firefox).
 */
export function PokedexGrid({ entries }: { entries: PokedexEntry[] }): React.ReactElement {
  // The virtualizer is a mutable instance; memoizing renders around it would freeze the visible rows.
  "use no memo";
  const columns = useSyncExternalStore(subscribeToBreakpoints, currentColumns);
  const rows = toRows(entries, columns);
  const listRef = useRef<HTMLDivElement>(null);
  const scrollMargin = useDocumentOffset(listRef);
  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    gap: GAP,
    overscan: 3,
    scrollMargin,
  });

  return (
    <div ref={listRef} className="relative" style={{ height: virtualizer.getTotalSize() }}>
      {virtualizer.getVirtualItems().map((row) => (
        <div
          key={row.key}
          data-index={row.index}
          ref={virtualizer.measureElement}
          className="absolute top-0 left-0 grid w-full gap-4"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            transform: `translateY(${row.start - scrollMargin}px)`,
          }}
        >
          {rows[row.index]?.map((p) => (
            <PokedexCard key={p.id} entry={p} />
          ))}
        </div>
      ))}
    </div>
  );
}

function PokedexCard({ entry }: { entry: PokedexEntry }): React.ReactElement {
  return (
    <Link
      to="/pokemon/$id"
      params={{ id: String(entry.id) }}
      className="group block rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
    >
      <div className="mb-2 text-center">
        <PokemonImage src={entry.image} name={entry.name} size="md" className="mx-auto" />
      </div>
      <div className="text-center">
        <span className="mb-1 block text-xs text-muted-foreground">
          #{String(entry.id).padStart(3, "0")}
        </span>
        <span className="block font-medium capitalize">{entry.name}</span>
        <div className="mt-2 flex justify-center gap-1">
          {entry.types.map((type) => (
            <TypeBadge key={type} type={type} />
          ))}
        </div>
      </div>
    </Link>
  );
}
