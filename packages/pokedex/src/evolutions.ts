import type { api } from "@simpledex/backend/convex/_generated/api";
import type { FunctionReturnType } from "convex/server";

/** One Pokémon in an Evolution Chain. */
export type EvolutionStage = NonNullable<
  FunctionReturnType<typeof api.pokemon.getEvolutions>
>[number];

export interface EvolutionLink {
  stage: EvolutionStage;
  /** How the later stage evolves from the earlier one, e.g. "Level 16". */
  method?: string;
}

export interface EvolutionLinks {
  from?: EvolutionLink;
  into: EvolutionLink[];
  chain: EvolutionStage[];
}

/** What a Pokémon evolves from and into within its Evolution Chain. */
export function evolutionLinks(stages: EvolutionStage[], pokedexNumber: number): EvolutionLinks {
  const current = stages.find((s) => s.id === pokedexNumber);
  const parent = stages.find((s) => s.id === current?.from);
  return {
    ...(parent ? { from: { stage: parent, method: current?.method } } : {}),
    into: stages
      .filter((s) => s.from === pokedexNumber)
      .map((stage) => ({ stage, method: stage.method })),
    chain: stages,
  };
}
