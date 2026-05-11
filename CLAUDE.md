# SimpleDex Design Language

## Philosophy
Clean, minimal, reference-first. The design should feel like a well-organized field guide — clear typography, generous whitespace, and obvious navigation. Prioritize readability and scanability over decoration. Pokemon data is the hero; the UI gets out of the way.

## Colors

### Light
- **Background**: `oklch(1 0 0)` — white
- **Foreground**: `oklch(0.145 0 0)` — near-black
- **Muted**: `oklch(0.97 0 0)` — light gray
- **Muted text**: `oklch(0.556 0 0)` — medium gray
- **Primary**: `oklch(0.205 0 0)` — near-black for emphasis
- **Border**: `oklch(0.922 0 0)` — light border
- **Card**: white with subtle border

### Dark
- **Background**: `oklch(0.145 0 0)` — near-black
- **Foreground**: `oklch(0.985 0 0)` — near-white
- **Card**: `oklch(0.205 0 0)` — dark card
- **Muted**: `oklch(0.269 0 0)` — dark gray
- **Border**: `oklch(1 0 0 / 10%)` — subtle white border

### Pokemon Type Colors
Each type has a semantic color (used for badges):
- grass, fire, water, electric, ice, fighting, poison, ground, flying, psychic, bug, rock, ghost, dragon, dark, steel, fairy, normal

## Typography
- **Font**: Inter Variable (sans-serif) via `--font-sans`
- **Headings**: Bold, clean weight
- **Body**: Regular weight, comfortable leading
- **Monospace**: Not used currently
- **Scale**: 12px (xs), 14px (sm), 16px (base), 18px (lg), 24px (xl) via Tailwind

## Component Patterns

### Cards
- Rounded corners via `--radius` (0.625rem default)
- Light border (`border-border`)
- `bg-card text-card-foreground`
- Used for: Pokemon cards, detail sections, stat blocks

### Navigation
- Simple text links in header
- Sticky header with backdrop blur (`bg-background/80 backdrop-blur-sm`)
- Active state via `activeProps` on TanStack Link

### Type Badges
- Rounded-full pills with type-specific background colors
- White text, small font
- Type icon (from lucide-react) alongside label

### Pokemon Grid
- 2-col mobile, 4-col desktop grid
- Centered artwork, ID number, name, type badges
- Hover: `hover:bg-accent` background shift

### Buttons
- Solid backgrounds with clear hover states
- Outline variant for secondary actions
- No rounded corners (rounded-none) for dropdown items
- Icon buttons for theme toggle, navigation

### Search
- Full-width input with search icon
- Debounced input (300ms) to avoid excessive queries
- Loading spinner during debounce

## Do's
- Use clear typographic hierarchy
- Let Pokemon artwork be the visual focus
- Keep interactions obvious and direct
- Use responsive grids for collections
- Lazy-load images in lists

## Don'ts
- No decorative elements that distract from data
- No custom fonts beyond Inter Variable
- No heavy animations or transitions
- No gradient backgrounds
- Don't hide information behind hover states
- Avoid complex nested layouts
