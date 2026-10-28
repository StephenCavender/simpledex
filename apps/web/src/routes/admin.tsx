import { api } from "@simpledex/backend/convex/_generated/api";
import { GENERATIONS } from "@simpledex/backend/convex/generations";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useState } from "react";
import { useUser } from "@clerk/clerk-react";

export const Route = createFileRoute("/admin")({
  component: AdminComponent,
});

const SYNC_COMMANDS = [
  { command: "bun run sync", description: "all Generations" },
  { command: `bun run sync '{"gens":[1,2]}'`, description: "Gen I and II" },
  { command: `bun run sync '{"numbers":[25,133]}'`, description: "specific Pokédex numbers" },
  { command: `bun run sync:prod '{"force":true}'`, description: "re-sync production" },
];

function AdminComponent() {
  const user = useUser();
  const navigate = useNavigate();
  const pokedex = useQuery(api.pokemon.pokedex);
  const [genFilter, setGenFilter] = useState<number | null>(null);

  // Restrict access to steve only
  if (user && user.user?.username !== "steve") {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <div className="rounded-lg border bg-card p-6 text-center">
          <h1 className="mb-2 text-2xl font-bold">Access Denied</h1>
          <p className="mb-4 text-muted-foreground">
            The admin page is restricted to authorized users only.
          </p>
          <Link to="/" className="text-sm text-primary hover:underline">
            ← Back to Pokemon
          </Link>
        </div>
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    navigate({ to: "/" });
    return null;
  }

  const totalSynced = pokedex?.length ?? 0;

  const genCounts = GENERATIONS.map((gen) => ({
    ...gen,
    count: gen.last - gen.first + 1,
    synced: pokedex?.filter((entry) => entry.generation === gen.number).length ?? 0,
  }));

  const filteredCounts = genFilter ? genCounts.filter((g) => g.number === genFilter) : genCounts;

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
          onChange={(e) => setGenFilter(e.target.value ? parseInt(e.target.value) : null)}
          className="h-10 rounded-lg border bg-background px-4 text-sm outline-none"
        >
          <option value="">All Generations</option>
          {GENERATIONS.map((g) => (
            <option key={g.number} value={g.number}>
              {g.label} ({g.region})
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
            <div key={gen.number} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium">
                  {gen.label} ({gen.region})
                </p>
                <p className="text-sm text-muted-foreground">
                  Pokédex numbers: {gen.first}–{gen.last}
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
                      width: `${Math.min((gen.synced / gen.count) * 100, 100)}%`,
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
          Run from <code>packages/backend</code>. Already-synced Pokémon are skipped unless{" "}
          <code>force</code> is set. Production commands need a deploy key in{" "}
          <code>.env.prod.local</code> (see the backend README).
        </p>
        <div className="space-y-2 text-sm">
          {SYNC_COMMANDS.map(({ command, description }) => (
            <p key={command}>
              <code className="rounded bg-muted px-2 py-1">{command}</code>
              <span className="ml-2 text-muted-foreground">({description})</span>
            </p>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Runs in batches of 50 Pokémon; a full Sync takes about 5–10 minutes. Watch progress above
          or in the Convex logs.
        </p>
      </div>
    </div>
  );
}
