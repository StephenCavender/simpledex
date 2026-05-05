export function PokemonSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 animate-pulse">
      <div className="mb-2 flex justify-center">
        <div className="h-24 w-24 rounded bg-muted" />
      </div>
      <div className="text-center">
        <div className="mx-auto mb-1 h-3 w-8 rounded bg-muted" />
        <div className="mx-auto mb-2 h-4 w-20 rounded bg-muted" />
        <div className="mx-auto h-5 w-16 rounded-full bg-muted" />
      </div>
    </div>
  );
}

export function PokemonListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <PokemonSkeleton key={i} />
      ))}
    </div>
  );
}
