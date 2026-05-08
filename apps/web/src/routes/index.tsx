import { api } from "@simpledex/backend/convex/_generated/api";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  Search,
  Info,
  Zap,
  Flame as Fire,
  Droplets as Water,
  Leaf as Grass,
  Snowflake as Ice,
  Mountain,
  Bug,
  Ghost,
  Skull,
  Brain,
  Bird,
  Biohazard,
  Anvil,
  Sparkles,
  Circle,
  Swords,
} from "lucide-react";

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
  const [selectedGen, setSelectedGen] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [allPokemon, setAllPokemon] = useState<any[]>([]);
  const scrollRef = useRef(0);

  useEffect(() => {
    setAllPokemon([]);
    setCursor(undefined);
  }, [search, selectedType, selectedGen]);

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

  const pokemonData = useQuery(api.pokemon.list, {
    search: debouncedSearch || undefined,
    type: selectedType || undefined,
    limit: 50,
    cursor,
    generation: selectedGen || undefined,
  });

  useEffect(() => {
    if (pokemonData?.pokemon) {
      setAllPokemon((prev) => [...prev, ...pokemonData.pokemon]);
    }
  }, [pokemonData]);

  useEffect(() => {
    if (scrollRef.current && allPokemon.length > 0) {
      window.scrollTo(0, scrollRef.current);
      scrollRef.current = 0;
    }
  }, [allPokemon.length]);

  const loadMore = useCallback(() => {
    scrollRef.current = window.scrollY;
    if (pokemonData?.nextCursor) {
      setCursor(pokemonData.nextCursor);
    }
  }, [pokemonData]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const types = useQuery(api.pokemon.listTypes);

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

      <div className="mb-6">
        <select
          value={selectedGen || ""}
          onChange={(e) => setSelectedGen(e.target.value ? parseInt(e.target.value) : null)}
          className="h-10 cursor-pointer rounded-lg border bg-background px-4 text-sm outline-none"
        >
          <option value="">All Generations</option>
          <option value="1">Gen I (Kanto)</option>
          <option value="2">Gen II (Johto)</option>
          <option value="3">Gen III (Hoenn)</option>
          <option value="4">Gen IV (Sinnoh)</option>
          <option value="5">Gen V (Unova)</option>
          <option value="6">Gen VI (Kalos)</option>
          <option value="7">Gen VII (Alola)</option>
          <option value="8">Gen VIII (Galar)</option>
          <option value="9">Gen IX (Paldea)</option>
        </select>
      </div>

      {types && types.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType(null)}
            className={`cursor-pointer px-3 py-1 text-xs rounded-full transition-colors ${
              selectedType === null ? "bg-foreground text-background" : "bg-muted hover:bg-muted/80"
            }`}
          >
            All
          </button>
          {types.map((t) => (
            <button
              key={t.name}
              onClick={() => setSelectedType(selectedType === t.name ? null : t.name)}
              className={`cursor-pointer px-3 py-1 text-xs rounded-full transition-colors ${
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

      {!pokemonData ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : allPokemon.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No Pokemon found</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {allPokemon.map((p) => (
              <Link
                 key={p._id}
                 to="/pokemon/$id"
                 params={{ id: String(p.id) }}
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
                    {p.types.map((type: string) => {
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
              </Link>
             ))}
           </div>
          {pokemonData?.nextCursor && (
            <div className="mt-6 text-center">
              <button
                onClick={loadMore}
                className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
