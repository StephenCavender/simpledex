/**
 * Generation module: the single source of truth for which Pokédex numbers
 * belong to which Generation. Pure, no Convex functions; shared by the
 * backend and the web app.
 */

export interface Generation {
  number: number;
  label: string;
  region: string;
  first: number;
  last: number;
}

export const GENERATIONS: readonly Generation[] = [
  { number: 1, label: "Gen I", region: "Kanto", first: 1, last: 151 },
  { number: 2, label: "Gen II", region: "Johto", first: 152, last: 251 },
  { number: 3, label: "Gen III", region: "Hoenn", first: 252, last: 386 },
  { number: 4, label: "Gen IV", region: "Sinnoh", first: 387, last: 493 },
  { number: 5, label: "Gen V", region: "Unova", first: 494, last: 649 },
  { number: 6, label: "Gen VI", region: "Kalos", first: 650, last: 721 },
  { number: 7, label: "Gen VII", region: "Alola", first: 722, last: 809 },
  { number: 8, label: "Gen VIII", region: "Galar", first: 810, last: 905 },
  { number: 9, label: "Gen IX", region: "Paldea", first: 906, last: 1025 },
];

export const MAX_POKEDEX_NUMBER: number = GENERATIONS[GENERATIONS.length - 1]?.last ?? 0;

export function generationOf(pokedexNumber: number): number | undefined {
  if (!Number.isInteger(pokedexNumber)) return undefined;
  return GENERATIONS.find((g) => pokedexNumber >= g.first && pokedexNumber <= g.last)?.number;
}
