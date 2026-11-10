# Store listing

Copy for the App Store and Google Play listings (#15). Paste it into App Store Connect and the Play Console; this file is the source of truth, so change it here first. Character limits are each store's; counts were checked when the copy was written.

## Rules for every field

- Pokémon names and "Pokémon" may appear in the description, used to say what the app covers, with the unofficial notice. Keep them out of the subtitle, keywords, short description, icon, and screenshots (`docs/research/pokemon-ip.md`: Apple 2.3.7 and 5.2, Play's IP policy).
- Screenshots and previews must not show recognisable Pokémon artwork. Take them in screenshot mode (`apps/mobile/README.md`, "Store screenshots").
- Describe only what the app does today.

## App Store (App Store Connect)

| Field              | Value                                      |
| ------------------ | ------------------------------------------ |
| Name (30)          | SimpleDex                                  |
| Subtitle (30)      | Stats, types & evolutions                  |
| Primary category   | Reference                                  |
| Secondary category | Entertainment                              |
| Price              | Free                                       |
| Copyright          | 2026 Stephen Cavender                      |
| Privacy Policy URL | https://mkt.simpledex.cavender.dev/privacy |
| Support URL        | https://mkt.simpledex.cavender.dev         |
| Marketing URL      | https://mkt.simpledex.cavender.dev         |

### Promotional text (170)

Look up any entry from #001 to #1025. Search by name or number, filter by type and generation, and keep everything you've looked up available offline.

### Keywords (100 bytes, comma-separated, no spaces)

```
dex,reference,stats,evolution,types,abilities,generation,offline,lookup,guide,creature,monster,chart
```

### Description (4000)

```
SimpleDex is a fast, no-nonsense reference for Pokémon. Open it, find the one you're thinking of, and get the facts.

THE WHOLE NATIONAL POKÉDEX
Scroll every entry from #001 to #1025 in one smooth list, from Generation I to Generation IX.

FIND ANY POKÉMON IN SECONDS
• Search by name, or by number: 25, 025, and #25 all work
• Filter by Type and by Generation, and combine filters with your search
• Clear everything in one tap

EVERYTHING ON ONE SCREEN
• Large artwork, Types, height, and weight
• Abilities, including hidden abilities
• Base stats
• Habitat and color
• The full Evolution Chain: tap any stage to jump to it

WORKS OFFLINE
Anything you've opened stays available without a connection, artwork included, so it still works on a train or a plane.

MADE TO FIT YOUR PHONE
• Follows your device's light or dark mode, or choose Light or Dark yourself
• Native navigation and gestures

NO ACCOUNTS, NO ADS, NO TRACKING
SimpleDex never asks who you are. There are no ads, no analytics, and no in-app purchases.

Data comes from PokeAPI, the open community Pokémon database.

SimpleDex is an unofficial fan app. It isn't affiliated with, endorsed by, or sponsored by Nintendo, Game Freak, Creatures, or The Pokémon Company. Pokémon and Pokémon character names are trademarks of Nintendo.
```

### What's New in This Version (3.0.0)

```
SimpleDex is back, rebuilt from the ground up:
• The whole National Pokédex, #001 to #1025
• Search by name or number, and filter by Type and Generation
• Stats, abilities, and Evolution Chains for every Pokémon
• Works offline for anything you've looked up
• Light and dark mode
```

### App Review notes

```
SimpleDex has no login, accounts, or in-app purchases; every feature is available on launch.

It is a reference app: Pokédex data comes from PokeAPI (https://pokeapi.co), an open community database, and is served from the app's own backend. Artwork is loaded from PokeAPI's public sprite repository. The app states that it is an unofficial fan app, not affiliated with Nintendo, Game Freak, Creatures, or The Pokémon Company, in this description and in its Terms (https://mkt.simpledex.cavender.dev/terms).

To try it: search for "pikachu" or "25", tap the result, then tap a stage in its Evolution Chain. The filter button (top right) filters by Type and Generation; the info button (top left) opens About, with the Light / Dark / System theme setting.
```

### App Privacy

Answer from the privacy policy (`apps/marketing/src/privacy.njk`). SimpleDex collects no personal data and does no tracking. The one item to decide is EAS Update: each update check sends a random installation ID and the app version to Expo, which keeps them to deliver updates and count installs per update. Read Expo's guidance at https://expo.dev/privacy-explained before answering:

- If that counts as not collected (not linked to the user, only used to deliver the update): **Data Not Collected**.
- Otherwise: **Usage Data → Product Interaction** or **Diagnostics → Other Diagnostic Data**, used for **App Functionality**, **not linked** to the user, **not used for tracking**.

### Age rating

Answer **None** or **No** to every question, including unrestricted web access (links open in the browser, not inside the app). Expected rating: 4+.

### Screenshots

Required sizes, in light and dark, from screenshot mode:

- iPhone 6.9" (1320 × 2868 or 1290 × 2796)
- iPad 13" (2064 × 2752 or 2048 × 2732), because `supportsTablet` is on

Suggested set, in order: the Pokédex list; a search by number; the filter sheet with a Type and a Generation chosen; a detail screen with stats; the Evolution Chain; About with the theme picker.

## Google Play (Play Console)

| Field                  | Value                                                                  |
| ---------------------- | ---------------------------------------------------------------------- |
| App name (30)          | SimpleDex                                                              |
| Short description (80) | Fast reference: stats, types, abilities & evolutions. Offline, no ads. |
| Category               | Books & Reference                                                      |
| Contact email          | simpledex@cavender.dev                                                 |
| Website                | https://mkt.simpledex.cavender.dev                                     |
| Privacy policy         | https://mkt.simpledex.cavender.dev/privacy                             |

Full description (4000): the App Store description above.

Graphics: a 512 × 512 icon (from `packages/brand`), a 1024 × 500 feature graphic without Pokémon artwork, and at least two phone screenshots from screenshot mode.

Forms: Data safety answers match App Privacy above; content rating (IARC) answers are all "No"; no ads; target audience 13+ unless you want the Families policy requirements; app access is "All functionality is available without special access".
