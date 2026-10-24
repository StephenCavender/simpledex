# SimpleDex

SimpleDex is a Pokémon reference application spanning a React web app, an Eleventy marketing site, and a Convex backend.

## Language

### Pokédex

**Pokémon**:
A single creature form in the reference, identified by its Pokédex number.
_Avoid_: monster, entry (when you mean the creature itself)

**Pokédex number**:
A Pokémon's number in the National Pokédex (1–1025), unique per Pokémon and its primary identity in SimpleDex.
_Avoid_: id, dex id, national id

**Pokédex entry**:
The at-a-glance view of a Pokémon used for browsing: its Pokédex number, name, Types, image, and Generation.
_Avoid_: summary, list item, card

**Generation**:
A numbered era of Pokémon games (I–IX) with its home region, covering a contiguous range of Pokédex numbers.
_Avoid_: gen (in prose), region (as a synonym)

### Tooling

**Catalog**:
The single root-level mapping of dependency versions shared across workspace packages. A dependency belongs to the catalog when two or more workspaces declare it, or when its version must agree everywhere for correctness.
_Avoid_: shared versions, dependency list, version registry
