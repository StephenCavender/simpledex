import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/favorites")({
  component: FavoritesPage,
});

function FavoritesPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">My Favorite Pokémon</h1>
      <p className="text-muted-foreground">
        Your favorited Pokémon will appear here. Start adding favorites from the
        Pokédex!
      </p>
    </div>
  );
}
