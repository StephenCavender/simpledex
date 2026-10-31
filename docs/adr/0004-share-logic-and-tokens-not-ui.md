# Share logic and design tokens between web and mobile, not UI components

Status: accepted

The web and mobile apps share the Convex backend, a platform-agnostic `@simpledex/pokedex` package (Pokédex filtering, entry types, the list of Types), and a CSS-only `@simpledex/tokens` package (theme colours and Type colours) that both Tailwind builds import. Each app keeps its own components and navigation. Sharing UI was the alternative, but it would mean rewriting a working web app onto React Native primitives (react-native-web, or NativeWind/Tamagui with Expo Router on web) and giving up shadcn and TanStack Router, all for three screens.

## Considered Options

- **Universal UI (one component tree for both platforms).** Rejected for the rewrite cost described above.
- **Share logic only.** Rejected because the Type colours and theme palette would drift between apps.

## Consequences

- `@simpledex/ui` stays web-only (shadcn, base-ui, DOM).
- The Type-to-icon mapping is duplicated in each app. If it were shared by icon name, the web would have to import every lucide icon and lose tree-shaking.
- Before committing to a single token CSS file, a spike checks that both the web's `.dark` class and Uniwind's `@variant dark` theming accept it. If they don't, a TS token module generates both files.
