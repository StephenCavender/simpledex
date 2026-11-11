/** A Pokédex number as shown to users: `#` and at least three digits (`#025`, `#1025`). */
export function formatPokedexNumber(id: number): string {
  return `#${String(id).padStart(3, "0")}`;
}

/** A PokeAPI slug as words (`special-attack` → `special attack`). Capitalisation is left to the UI. */
export function formatSlug(slug: string): string {
  return slug.replace(/-/g, " ");
}

/** A base stat's name as words; HP is an abbreviation, so it's spelled out in capitals. */
export function formatStatName(slug: string): string {
  return slug === "hp" ? "HP" : formatSlug(slug);
}
