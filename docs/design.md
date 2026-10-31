# SimpleDex Design Language

Clean, minimal, reference-first, like a well-organized field guide. Pokémon artwork and data are the hero; the UI gets out of the way. The theme follows the device's light/dark setting, and both themes are first-class.

Color, radius, and font tokens are CSS variables in `packages/ui/src/styles/globals.css`, imported by `apps/web/src/index.css`. Use tokens like `bg-card`, `text-muted-foreground`, and `border-border`, not literal colors. Each Pokémon Type has a badge color token, `--type-<name>`, in `apps/web/src/index.css`, chosen so white text meets WCAG AA.

## Patterns

- **Cards**: `bg-card text-card-foreground`, `rounded` via `--radius`, light `border-border`.
- **Header**: sticky, `bg-background/80 backdrop-blur-sm`, plain text links, active state via TanStack `activeProps`.
- **Type badges**: `<TypeBadge>` (`apps/web/src/components/type-badge.tsx`): rounded-full pills, `--type-<name>` background, white small text, lucide icon + label.
- **Pokémon images**: `<PokemonImage>` (`apps/web/src/components/pokemon-image.tsx`): lazy-loaded, with a placeholder when the image is missing or fails to load.
- **Pokémon grid**: 2 / 3 / 4 columns (mobile / tablet / desktop), artwork + ID + name + badges, `hover:bg-accent`, lazy-loaded images.
- **Evolutions**: `<Evolutions>` (`apps/web/src/components/evolutions.tsx`) on the detail page: what this Pokémon evolves from and into (with methods), then the whole Evolution Chain as small named sprites; single-stage Pokémon say "Does not evolve."
- **Buttons**: solid with clear hover; outline for secondary; icon buttons for theme toggle and nav; dropdown items `rounded-none`.
- **Search**: full-width with icon; filters instantly as you type (by name or Pokédex number).

## Don'ts

- No decorative elements, gradients, or heavy animation.
- No fonts besides Inter Variable.
- Don't hide information behind hover.
- Avoid deeply nested layouts.
