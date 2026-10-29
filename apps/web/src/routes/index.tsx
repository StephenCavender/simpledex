import { api } from "@simpledex/backend/convex/_generated/api";
import { createFileRoute, Link } from "@tanstack/react-router";
import { GENERATIONS } from "@simpledex/backend/convex/generations";
import { useQuery } from "convex/react";
import { PokemonImage } from "@/components/pokemon-image";
import { TypeBadge } from "@/components/type-badge";
import { filterPokedex, type PokedexFilters } from "@/lib/pokedex";
import { Search } from "lucide-react";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): PokedexFilters => ({
    q: typeof search.q === "string" && search.q !== "" ? search.q : undefined,
    type: typeof search.type === "string" && search.type !== "" ? search.type : undefined,
    gen: GENERATIONS.some((g) => g.number === Number(search.gen)) ? Number(search.gen) : undefined,
  }),
  component: HomeComponent,
});

function HomeComponent() {
  const filters = Route.useSearch();
  const navigate = Route.useNavigate();
  const pokedex = useQuery(api.pokemon.pokedex);
  const types = useQuery(api.pokemon.listTypes);
  const entries = pokedex ? filterPokedex(pokedex, filters) : undefined;

  const setFilters = (next: PokedexFilters): void => {
    void navigate({ search: (prev) => ({ ...prev, ...next }), replace: true });
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="mb-8 text-center">
        <a href="/about" className="inline-block mb-2">
          <img
            src="/logo.png"
            alt="SimpleDex"
            className="h-16 w-auto mx-auto hover:opacity-80 transition-opacity"
          />
        </a>
        <p className="text-muted-foreground">Your quick reference for Pokemon</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search by name or number..."
            value={filters.q ?? ""}
            onChange={(e) => setFilters({ q: e.target.value || undefined })}
            className="h-10 w-full rounded-lg border bg-background pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
          />
        </div>
      </div>

      <div className="mb-6">
        <select
          value={filters.gen ?? ""}
          onChange={(e) => setFilters({ gen: e.target.value ? Number(e.target.value) : undefined })}
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

      {types && types.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilters({ type: undefined })}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              filters.type === undefined
                ? "bg-foreground text-background"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            All
          </button>
          {types.map((t) => (
            <button
              key={t.name}
              onClick={() => setFilters({ type: filters.type === t.name ? undefined : t.name })}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                filters.type === t.name
                  ? "bg-foreground text-background"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {!entries ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No Pokemon found</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {entries.map((p) => (
            <Link
              key={p.id}
              to="/pokemon/$id"
              params={{ id: String(p.id) }}
              className="group block rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
            >
              <div className="mb-2 text-center">
                <PokemonImage src={p.image} name={p.name} size="md" className="mx-auto" />
              </div>
              <div className="text-center">
                <span className="mb-1 block text-xs text-muted-foreground">
                  #{String(p.id).padStart(3, "0")}
                </span>
                <span className="block font-medium capitalize">{p.name}</span>
                <div className="mt-2 flex justify-center gap-1">
                  {p.types.map((type) => (
                    <TypeBadge key={type} type={type} />
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
