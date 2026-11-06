# SimpleDex Design Language

Clean, minimal, reference-first, like a well-organized field guide. Pokémon artwork and data are the hero; the UI gets out of the way. The theme follows the device's light/dark setting, and both themes are first-class.

Colour tokens live in `packages/tokens/theme.css` (`@simpledex/tokens`, format in [ADR-0006](adr/0006-one-token-file-in-uniwind-format.md)); radius and font tokens are in `packages/ui/src/styles/globals.css`. `apps/web/src/index.css` imports both. Use tokens like `bg-card`, `text-muted-foreground`, and `border-border`, not literal colors. Each Pokémon Type has a badge color token, `--color-type-<name>` (class `bg-type-<name>`), chosen so white text meets WCAG AA.

The logo lives in `packages/brand/logo.svg`. Every app icon, splash image, and favicon is generated from it; don't edit those by hand (see [setup.md](setup.md#logo-and-icons)).

## Patterns

- **Cards**: `bg-card text-card-foreground`, `rounded` via `--radius`, light `border-border`.
- **Header**: sticky, `bg-background/80 backdrop-blur-sm`, plain text links, active state via TanStack `activeProps`.
- **Type badges**: `<TypeBadge>` (`apps/web/src/components/type-badge.tsx`): rounded-full pills, `bg-type-<name>` background, white small text, lucide icon + label.
- **Pokémon images**: `<PokemonImage>` (`apps/web/src/components/pokemon-image.tsx`): lazy-loaded, with a placeholder when the image is missing or fails to load.
- **Mobile**: `apps/mobile/src/components/` has its own `<TypeBadge>` (same colours and icons, via `lucide-react-native`) and `<PokemonImage>` (`expo-image`, disk-cached, same placeholder). The Pokédex is a single-column `FlashList` with search in the native header, at the top on every platform: on iOS 26 it stays out of the bottom toolbar (`allowToolbarIntegration={false}`), because UIKit leaves that toolbar behind, empty, over pushed screens. A header button (with a `bg-destructive` dot while any filter is active) opens `<FilterSheet>`, a bottom sheet (a transparent `Modal` sliding up over a dimmed backdrop) with Type badges and Generation pills as single-choice options; the chosen one is ringed in `bg-foreground`. "Clear all" in the sheet and in the empty state clears search and filters together. The backdrop is `bg-black/40` in both themes; a scrim is the one place a literal colour is fine. Tapping an entry pushes the detail screen (`apps/mobile/src/app/pokemon/[id].tsx`, header titled with the Pokédex number), a single scrolling column in the web's order: number, name, and Type badges, large artwork, Height/Weight/Habitat/Color facts two to a row, abilities, base stats, and `<Evolutions>`. An info button on the left of the Pokédex header pushes the About screen (`apps/mobile/src/app/about.tsx`): what SimpleDex is, a PokeAPI credit, a developer credit linking to cavender.foo, and `<ThemePicker>`, a segmented Light / Dark / System control (chosen segment `bg-background` on `bg-muted`). The app follows the device (Uniwind's `system` theme) until a choice is made; the choice is saved in the `expo-sqlite` key-value store and restored at launch. Offline, the Pokédex and detail screens show whatever was cached; with nothing cached they say they need a connection (a muted message in place of "Loading…"), and species facts read "Offline".
- **Pokémon grid**: 2 / 3 / 4 columns (mobile / tablet / desktop), artwork + ID + name + badges, `hover:bg-accent`, lazy-loaded images.
- **Evolutions**: `<Evolutions>` (`apps/web/src/components/evolutions.tsx`) on the detail page: what this Pokémon evolves from and into (with methods), then the whole Evolution Chain as small named sprites; single-stage Pokémon say "Does not evolve." Mobile has its own `<Evolutions>` with the same layout; every other stage pushes that Pokémon's detail screen, and the current one is ringed in `border-primary`. The from/into logic (`evolutionLinks`) is shared from `@simpledex/pokedex`.
- **Buttons**: solid with clear hover; outline for secondary; icon buttons for theme toggle and nav; dropdown items `rounded-none`.
- **Search**: full-width with icon; filters instantly as you type (by name or Pokédex number).

## Don'ts

- No decorative elements, gradients, or heavy animation.
- No fonts besides Inter Variable.
- Don't hide information behind hover.
- Avoid deeply nested layouts.
