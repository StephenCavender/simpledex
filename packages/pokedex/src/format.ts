/** A Pokédex number as shown to users: `#` and at least three digits (`#025`, `#1025`). */
export function formatPokedexNumber(id: number): string {
  return `#${String(id).padStart(3, "0")}`;
}

/** A PokeAPI slug as words (`special-attack` → `special attack`). Capitalisation is left to the UI. */
export function formatSlug(slug: string): string {
  return slug.replace(/-/g, " ");
}

/**
 * A base stat's name, ready to show: each word capitalised, and HP as an
 * abbreviation. Done here rather than with a capitalise style, because iOS's
 * lowercases the rest of each word ("Hp").
 */
export function formatStatName(slug: string): string {
  if (slug === "hp") return "HP";
  return formatSlug(slug).replace(/\b\w/g, (letter) => letter.toUpperCase());
}
