import { api } from "@simpledex/backend/convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useState, useCallback, useEffect } from "react";
import { Search, Info, Zap, Flame as Fire, Droplets as Water, Leaf as Grass, Snowflake as Ice, Mountain, Bug, Ghost, Skull, Brain, Bird, Biohazard, Anvil, Sparkles, Circle, Swords } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  grass: Grass,
  fire: Fire,
  water: Water,
  ice: Ice,
  rock: Mountain,
  bug: Bug,
  ghost: Ghost,
  dragon: Skull,
  psychic: Brain,
  flying: Bird,
  ground: Mountain,
  poison: Biohazard,
  steel: Anvil,
  fairy: Sparkles,
  normal: Circle,
  fighting: Swords,
  electric: Zap,
};

const TYPE_COLORS: Record<string, string> = {
  grass: "bg-green-500",
  fire: "bg-red-500",
  water: "bg-blue-500",
  ice: "bg-cyan-500",
  rock: "bg-yellow-700",
  bug: "bg-green-700",
  ghost: "bg-purple-700",
  dragon: "bg-indigo-700",
  psychic: "bg-pink-600",
  flying: "bg-sky-300",
  ground: "bg-amber-600",
  poison: "bg-purple-600",
  steel: "bg-slate-400",
  fairy: "bg-pink-300",
  normal: "bg-gray-400",
  fighting: "bg-red-700",
  electric: "bg-yellow-400",
};

function HomeComponent() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (search !== debouncedSearch) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setDebouncedSearch(search);
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [search, debouncedSearch]);

  const pokemonList = useQuery(api.pokemon.list, {
    search: debouncedSearch || undefined,
    type: selectedType || undefined,
    limit: 50,
  });

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const types = useQuery(api.pokemon.listTypes);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">SimpleDex</h1>
        <p className="text-muted-foreground">Your quick reference for Pokemon</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          {isSearching ? (
            <div className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin border-2 border-primary border-t-transparent rounded-full" />
          ) : (
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          )}
          <input
            type="text"
            placeholder="Search Pokemon..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-10 w-full rounded-lg border bg-background pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
          />
        </div>
      </div>

      {types && types.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType(null)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              selectedType === null
                ? "bg-foreground text-background"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            All
          </button>
          {types.map((t) => (
            <button
              key={t.name}
              onClick={() =>
                setSelectedType(selectedType === t.name ? null : t.name)
              }
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedType === t.name
                  ? "bg-foreground text-background"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {pokemonList === undefined ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : pokemonList.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No Pokemon found
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {pokemonList.map((p) => (
            <a
              key={p._id}
              href={`/pokemon/${p.id}`}
              className="group block rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
            >
              <div className="mb-2 text-center">
                {p.artwork ? (
                  <img
                    src={p.artwork}
                    alt={p.name}
                    className="mx-auto h-24 w-24 object-contain"
                    loading="lazy"
                  />
                ) : p.sprite ? (
                  <img
                    src={p.sprite}
                    alt={p.name}
                    className="mx-auto h-24 w-24 object-contain"
                    loading="lazy"
                  />
                ) : (
                  <div className="mx-auto flex h-24 w-24 items-center justify-center text-muted-foreground">
                    <Info className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="text-center">
                <span className="mb-1 block text-xs text-muted-foreground">
                  #{String(p.id).padStart(3, "0")}
                </span>
                <span className="block font-medium capitalize">{p.name}</span>
                <div className="mt-2 flex justify-center gap-1">
                  {p.types.map((type) => {
                    const Icon = TYPE_ICONS[type] || Info;
                    return (
                      <span
                        key={type}
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium text-white ${TYPE_COLORS[type] || "bg-gray-400"}`}
                      >
                        <Icon className="mr-1 h-3 w-3" />
                        {type}
                      </span>
                    );
                  })}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}