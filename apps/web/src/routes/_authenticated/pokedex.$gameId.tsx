import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/pokedex/$gameId")({
  component: PokedexGamePage,
  pendingComponent: () => <div className="p-8 text-center">Loading...</div>,
});

function PokedexGamePage() {
  const { gameId } = Route.useParams();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">Pokédex: {gameId}</h1>
      <p className="mb-6 text-muted-foreground">
        Track your caught, seen, and shiny Pokémon for this game.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" />

    </div>
  );
}
