# One token file in Uniwind's format, compiled by both apps

Status: accepted

`@simpledex/tokens` is a single CSS file written in Uniwind's theming format: theme colours in `@layer theme { :root { @variant light {…} @variant dark {…} } }` and Type colours in `@theme static`. The web's Tailwind compiles the same file. Uniwind can't read the web's `:root` / `.dark` blocks, but plain Tailwind can read Uniwind's format if the web defines the two variants. So one hand-written file is enough, and nothing has to generate CSS for each platform (spike #5).

## Consequences

- The web defines the variants before importing the file: `@custom-variant dark (&:is(.dark, .dark *))` and `@custom-variant light (&:is(:not(.dark)))`. They compile to `:root:is(…)`, so next-themes' `.dark` class on `<html>` still switches the theme. The old `&:is(.dark *)` didn't match `<html>` itself.
- Plain Tailwind only generates utilities such as `bg-background` for registered theme keys, and Uniwind registers them without being told. The file ends with an `@theme inline reference { --color-x: var(--color-x); … }` block. It registers the names without emitting variables, and Uniwind ignores it. A new themed colour has to be added there as well as to both variants.
- Type colours must stay in `@theme static`. Without it, Tailwind drops theme variables that no class uses, and the web's Type badges lose their colour.
- Variables use Tailwind's names (`--color-background`, `--color-type-fire`), not shadcn's (`--background`). Web code that reads a variable directly must use the `--color-` name.

## Considered Options

- **A TS token module that generates one CSS file per platform.** Rejected: it adds a build step, and the spike showed one file already works for both apps.
