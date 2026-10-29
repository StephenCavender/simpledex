import { api } from "@simpledex/backend/convex/_generated/api";
import { MAX_POKEDEX_NUMBER } from "@simpledex/backend/convex/generations";
import { createFileRoute, Link, useCanGoBack, useRouter } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Evolutions } from "@/components/evolutions";
import { PokemonImage } from "@/components/pokemon-image";
import { TypeBadge } from "@/components/type-badge";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/pokemon/$id")({
  component: PokemonDetail,
});

/**
 * Returns to the previous page (so the Pokédex keeps its filters and scroll
 * position), falling back to the Pokédex when opened directly.
 */
function BackLink({ className = "" }: { className?: string }) {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  return (
    <Link
      to="/"
      onClick={(e) => {
        if (!canGoBack) return;
        e.preventDefault();
        router.history.back();
      }}
      className={`${className} inline-flex items-center text-sm text-muted-foreground hover:text-foreground`}
    >
      <ArrowLeft className="mr-1 h-4 w-4" />
      Back
    </Link>
  );
}

function PokemonDetail() {
  const { id } = Route.useParams();
  const pokemonId = parseInt(id, 10);

  const pokemon = useQuery(api.pokemon.getById, { id: pokemonId });
  const species = useQuery(api.pokemon.getSpecies, { id: pokemonId });
  // undefined while loading; null when the Pokémon has no synced Evolution Chain.
  const evolutions = useQuery(api.pokemon.getEvolutions, { pokemon: pokemonId });

  const prevId = pokemonId > 1 ? pokemonId - 1 : null;
  const nextId = pokemonId < MAX_POKEDEX_NUMBER ? pokemonId + 1 : null;

  if (pokemon === undefined) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <BackLink className="mb-4" />
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="h-48 w-48 rounded bg-muted animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg bg-muted p-4 animate-pulse">
                <div className="h-4 w-16 mx-auto mb-2 rounded bg-background/50" />
                <div className="h-6 w-24 mx-auto rounded bg-background/50" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!pokemon) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <BackLink className="mb-4" />
        <div className="text-center py-12">
          <p className="text-muted-foreground">Pokemon not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <BackLink />
        <div className="flex gap-2">
          {prevId && (
            <Link
              to="/pokemon/$id"
              params={{ id: String(prevId) }}
              replace
              className="px-3 py-1 text-sm bg-muted rounded hover:bg-muted/80"
            >
              ← Prev
            </Link>
          )}
          {nextId && (
            <Link
              to="/pokemon/$id"
              params={{ id: String(nextId) }}
              replace
              className="px-3 py-1 text-sm bg-muted rounded hover:bg-muted/80"
            >
              Next →
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="mb-6 text-center">
          <p className="mb-1 text-sm text-muted-foreground">
            #{String(pokemon.id).padStart(3, "0")}
          </p>
          <h1 className="mb-4 text-4xl font-bold capitalize">{pokemon.name}</h1>
          <div className="flex justify-center gap-2">
            {pokemon.types.map((type) => (
              <TypeBadge key={type} type={type} size="md" />
            ))}
          </div>
        </div>

        <div className="mb-8 flex justify-center">
          <PokemonImage src={pokemon.artwork ?? pokemon.sprite} name={pokemon.name} size="lg" />
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

        {evolutions !== null && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-3">Evolutions</h2>
            {evolutions ? (
              <Evolutions stages={evolutions} pokedexNumber={pokemonId} />
            ) : (
              <p className="text-sm text-muted-foreground">Loading evolutions...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
