import { api } from "@simpledex/backend/convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { ArrowLeft, Info, Zap, Flame as Fire, Droplets as Water, Leaf as Grass, Snowflake as Ice, Mountain, Bug, Ghost, Skull, Brain, Bird, Biohazard, Anvil, Sparkles, Circle, Swords, RefreshCw, MapPin } from "lucide-react";

export const Route = createFileRoute("/pokemon/$id")({
  component: PokemonDetail,
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

function PokemonDetail() {
  const { id } = Route.useParams();
  const pokemonId = parseInt(id, 10);
  const [showEncounters, setShowEncounters] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const pokemon = useQuery(api.pokemon.getById, { id: pokemonId });
  const species = useQuery(api.pokemon.getSpecies, { id: pokemonId });
  const evolutionChainId = species?.evolutionChainId;

  const evolutionData = useQuery(
    evolutionChainId ? api.pokemon.getEvolutionChain : undefined,
    evolutionChainId ? { id: evolutionChainId } : undefined
  );

  const encounters = useQuery(
    showEncounters ? api.pokemon.getEncounters : undefined,
    showEncounters ? { pokemonId } : undefined
  );

  const fetchEvolution = useMutation(api.pokemon.fetchEvolutionChain);
  const fetchEncounters = useMutation(api.pokemon.fetchEncounters);

  const loadEvolution = async () => {
    if (evolutionChainId) {
      setLoading("evolution");
      try {
        await fetchEvolution({ chainId: evolutionChainId });
      } finally {
        setLoading(null);
      }
    }
  };

  const loadEncounters = async () => {
    setShowEncounters(true);
    setLoading("encounters");
    try {
      await fetchEncounters({ pokemonId });
    } finally {
      setLoading(null);
    }
  };

  const prevId = pokemonId > 1 ? pokemonId - 1 : null;
  const nextId = pokemonId < 151 ? pokemonId + 1 : null;

  if (pokemon === undefined) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <a href="/" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </a>
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!pokemon) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <a href="/" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </a>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Pokemon not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <a href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </a>
        <div className="flex gap-2">
          {prevId && (
            <a href={`/pokemon/${prevId}`} className="px-3 py-1 text-sm bg-muted rounded hover:bg-muted/80">
              ← Prev
            </a>
          )}
          {nextId && (
            <a href={`/pokemon/${nextId}`} className="px-3 py-1 text-sm bg-muted rounded hover:bg-muted/80">
              Next →
            </a>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="mb-6 text-center">
          <p className="mb-1 text-sm text-muted-foreground">#{String(pokemon.id).padStart(3, "0")}</p>
          <h1 className="mb-4 text-4xl font-bold capitalize">{pokemon.name}</h1>
          <div className="flex justify-center gap-2">
            {pokemon.types.map((type) => {
              const Icon = TYPE_ICONS[type] || Info;
              return (
                <span
                  key={type}
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-white ${TYPE_COLORS[type] || "bg-gray-400"}`}
                >
                  <Icon className="mr-1 h-4 w-4" />
                  {type}
                </span>
              );
            })}
          </div>
        </div>

        <div className="mb-8 flex justify-center">
          {pokemon.artwork ? (
            <img
              src={pokemon.artwork}
              alt={pokemon.name}
              className="h-48 w-48 object-contain"
            />
          ) : pokemon.sprite ? (
            <img
              src={pokemon.sprite}
              alt={pokemon.name}
              className="h-48 w-48 object-contain"
            />
          ) : (
            <div className="flex h-48 w-48 items-center justify-center text-muted-foreground">
              <Info className="h-16 w-16" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="mb-1 text-xs text-muted-foreground">Height</p>
            <p className="text-lg font-semibold">{pokemon.height} m</p>
          </div>
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="mb-1 text-xs text-muted-foreground">Weight</p>
            <p className="text-lg font-semibold">{pokemon.weight} kg</p>
          </div>
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="mb-1 text-xs text-muted-foreground">Habitat</p>
            <p className="text-lg font-semibold capitalize">{species?.habitat || "Unknown"}</p>
          </div>
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="mb-1 text-xs text-muted-foreground">Color</p>
            <p className="text-lg font-semibold capitalize">{species?.color || "Unknown"}</p>
          </div>
        </div>

        {pokemon.abilities && pokemon.abilities.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 text-lg font-semibold">Abilities</h2>
            <div className="flex flex-wrap gap-2">
              {pokemon.abilities.map((ability) => (
                <span
                  key={ability.name}
                  className={`rounded-full px-3 py-1 text-sm capitalize ${ability.isHidden ? "bg-muted italic" : "bg-secondary"}`}
                >
                  {ability.name.replace(/-/g, " ")}
                  {ability.isHidden && " (hidden)"}
                </span>
              ))}
            </div>
          </div>
        )}

        {pokemon.stats && pokemon.stats.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 text-lg font-semibold">Base Stats</h2>
            <div className="space-y-2">
              {pokemon.stats.map((stat) => (
                <div key={stat.name} className="flex items-center gap-2">
                  <span className="w-24 text-xs capitalize text-muted-foreground">
                    {stat.name.replace(/-/g, " ")}
                  </span>
                  <div className="flex-1 rounded-full bg-muted p-0.5">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${Math.min(stat.value, 100)}%` }}
                    />
                  </div>
                  <span className="w-8 text-xs font-medium">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {evolutionChainId && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Evolutions</h2>
              <button
                onClick={loadEvolution}
                disabled={loading !== null}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className="h-3 w-3" />
                Load
              </button>
            </div>
            {evolutionData?.chain ? (
              <div className="flex items-center gap-4 flex-wrap">
                <div className="text-center">
                  {pokemon.sprite && (
                    <img src={pokemon.sprite} alt={pokemon.name} className="h-16 w-16 object-contain" />
                  )}
                  <p className="text-sm capitalize mt-1">{evolutionData.chain.species}</p>
                </div>
                {evolutionData.chain.evolvesTo?.map((ev: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-2xl">→</span>
                    <div className="text-center">
                      <p className="text-sm font-medium capitalize">{ev.species}</p>
                      <p className="text-xs text-muted-foreground">{ev.method}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Click Load to fetch evolution data</p>
            )}
          </div>
        )}

        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Locations
            </h2>
            <button
              onClick={loadEncounters}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Load
            </button>
          </div>
          {encounters?.length ? (
            <div className="space-y-2">
              {encounters.slice(0, 10).map((enc, i) => (
                <div key={i} className="flex justify-between items-center text-sm bg-muted p-2 rounded">
                  <span className="capitalize">{enc.location}</span>
                  <div className="text-xs text-muted-foreground">
                    <span className="capitalize mr-2">{enc.method}</span>
                    {enc.chance && `${enc.chance}%`}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Click Load to find locations</p>
          )}
        </div>
      </div>
    </div>
  );
}