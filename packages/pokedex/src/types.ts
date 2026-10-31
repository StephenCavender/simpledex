/** Every Type a Pokémon can have. */
export const POKEMON_TYPES = [
  "normal",
  "fighting",
  "flying",
  "poison",
  "ground",
  "rock",
  "bug",
  "ghost",
  "steel",
  "fire",
  "water",
  "grass",
  "electric",
  "psychic",
  "ice",
  "dragon",
  "dark",
  "fairy",
] as const;

export type PokemonType = (typeof POKEMON_TYPES)[number];

export function isPokemonType(type: string): type is PokemonType {
  return POKEMON_TYPES.some((known) => known === type);
}
