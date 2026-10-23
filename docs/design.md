# SimpleDex Design Language

Clean, minimal, reference-first, like a well-organized field guide. Pokémon artwork and data are the hero; the UI gets out of the way. Dark mode is the default, and light mode is supported.

Color, radius, and font tokens are defined as CSS variables in `apps/web/src/index.css` (the source of truth). Use tokens like `bg-card`, `text-muted-foreground`, and `border-border`, not literal colors. Each Pokémon type has a semantic badge color.

## Patterns

- **Cards**: `bg-card text-card-foreground`, `rounded` via `--radius`, light `border-border`.
- **Header**: sticky, `bg-background/80 backdrop-blur-sm`, plain text links, active state via TanStack `activeProps`.
- **Type badges**: rounded-full pills, type color background, white small text, lucide icon + label.
- **Pokémon grid**: 2 / 3 / 4 columns (mobile / tablet / desktop), artwork + ID + name + badges, `hover:bg-accent`, lazy-loaded images.
- **Buttons**: solid with clear hover; outline for secondary; icon buttons for theme toggle and nav; dropdown items `rounded-none`.
- **Search**: full-width with icon, debounced input, spinner while pending.

## Don'ts

- No decorative elements, gradients, or heavy animation.
- No fonts besides Inter Variable.
- Don't hide information behind hover.
- Avoid deeply nested layouts.
