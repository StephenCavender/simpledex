import { Link } from "expo-router";

/** Wraps a pressable so tapping it pushes the Pokémon's detail screen; back returns here. */
export function PokemonLink({
  pokedexNumber,
  children,
}: {
  pokedexNumber: number;
  children: React.ReactElement;
}): React.JSX.Element {
  return (
    <Link href={{ pathname: "/pokemon/[id]", params: { id: String(pokedexNumber) } }} push asChild>
      {children}
    </Link>
  );
}
