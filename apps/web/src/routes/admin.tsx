import { api } from "@simpledex/backend/convex/_generated/api";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useState } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminComponent,
});

const GENERATIONS = [
  { id: 1, name: "Gen I (Kanto)", range: "1-151", count: 151 },
  { id: 2, name: "Gen II (Johto)", range: "152-251", count: 100 },
  { id: 3, name: "Gen III (Hoenn)", range: "252-386", count: 135 },
  { id: 4, name: "Gen IV (Sinnoh)", range: "387-493", count: 107 },
  { id: 5, name: "Gen V (Unova)", range: "494-649", count: 156 },
  { id: 6, name: "Gen VI (Kalos)", range: "650-721", count: 72 },
  { id: 7, name: "Gen VII (Alola)", range: "722-809", count: 88 },
  { id: 8, name: "Gen VIII (Galar)", range: "810-905", count: 96 },
  { id: 9, name: "Gen IX (Paldea)", range: "906-1025", count: 120 },
];

function AdminComponent() {
  const allPokemon = useQuery(api.pokemon.list, { limit: 10000 });
  const [genFilter, setGenFilter] = useState<number | null>(null);

  const totalSynced = allPokemon?.pokemon?.length || 0;

  const genCounts = GENERATIONS.map((gen) => {
    const count = allPokemon?.pokemon?.filter(
      (p: any) => p.generationId === gen.id
    ).length || 0;
    return { ...gen, synced: count };
  });

  const filteredCounts = genFilter
    ? genCounts.filter((g) => g.id === genFilter)
    : genCounts;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Pokemon
        </Link>
      </div>

      {/* Total Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-card p-4 text-center">
          <p className="mb-1 text-xs text-muted-foreground">Total Synced</p>
          <p className="text-2xl font-bold">{totalSynced}</p>
        </div>
        <div className="rounded-lg bg-card p-4 text-center">
          <p className="mb-1 text-xs text-muted-foreground">Generations</p>
          <p className="text-2xl font-bold">
            {genCounts.filter((g) => g.synced > 0).length} / {GENERATIONS.length}
          </p>
        </div>
      </div>

      {/* Generation Filter */}
      <div className="mb-4">
        <select
          value={genFilter || ""}
          onChange={(e) =>
            setGenFilter(e.target.value ? parseInt(e.target.value) : null)
          }
          className="h-10 rounded-lg border bg-background px-4 text-sm outline-none"
        >
          <option value="">All Generations</option>
          {GENERATIONS.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {/* Per-Generation Stats */}
      <div className="rounded-lg border bg-card">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold">Sync Status by Generation</h2>
        </div>
        <div className="divide-y">
          {filteredCounts.map((gen) => (
            <div
              key={gen.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <p className="font-medium">{gen.name}</p>
                <p className="text-sm text-muted-foreground">
                  IDs: {gen.range}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {gen.synced} / {gen.count}
                </p>
                <div className="mt-1 h-2 w-32 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      gen.synced === gen.count
                        ? "bg-green-500"
                        : gen.synced > 0
                          ? "bg-yellow-500"
                          : "bg-gray-300"
                    }`}
                    style={{
                      width: `${Math.min(
                        (gen.synced / gen.count) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How to Sync */}
      <div className="mt-6 rounded-lg border bg-card p-6">
        <h2 className="mb-3 font-semibold">How to Sync</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Run the sync script from the backend directory. Use --limit to specify
          how many Pokemon to sync (by ID range).
        </p>
        <div className="space-y-2 text-sm">
          <p>
            <code className="rounded bg-muted px-2 py-1">
              bun packages/backend/scripts/sync.ts --limit=251
            </code>
            <span className="ml-2 text-muted-foreground">
              (syncs Gen 1-2)
            </span>
          </p>
          <p>
            <code className="rounded bg-muted px-2 py-1">
              bun packages/backend/scripts/sync.ts --limit=1025
            </code>
            <span className="ml-2 text-muted-foreground">
              (syncs all generations)
            </span>
          </p>
          <p>
            <code className="rounded bg-muted px-2 py-1">
              bun packages/backend/scripts/sync.ts --limit=251 --force
            </code>
            <span className="ml-2 text-muted-foreground">
              (force re-sync)
            </span>
          </p>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Note: 30s delay between each Pokemon to avoid rate limiting.
          A full sync takes ~8.5 hours.
        </p>
      </div>
    </div>
  );
}
