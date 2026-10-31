/** A Pokédex number as shown to users: `#` and at least three digits (`#025`, `#1025`). */
export function formatPokedexNumber(id: number): string {
  return `#${String(id).padStart(3, "0")}`;
}

/** A PokeAPI slug as words (`special-attack` → `special attack`). Capitalisation is left to the UI. */
export function formatSlug(slug: string): string {
  return slug.replace(/-/g, " ");
}
