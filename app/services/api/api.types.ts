import { GeneralApiProblem } from "./api-problem"
import { Species } from "../../models/species/species"
import { Pokemon } from "../../models/pokemon/pokemon"
import { EvolutionChain } from "../../models/evolution/evolution-chain"
import { EvolutionTrigger } from "../../models/evolution/evolution-trigger"

// Species
export type GetAllSpeciesResult = { kind: "ok"; species: Species[] } | GeneralApiProblem
export type GetSpeciesResult = { kind: "ok"; species: Species } | GeneralApiProblem

// Pokemon
export type GetPokemonResult = { kind: "ok"; pokemon: Pokemon } | GeneralApiProblem

// Evolution
export type GetEvolutionChainResult = { kind: "ok"; chain: EvolutionChain } | GeneralApiProblem
export type GetEvolutionTriggerResult = { kind: "ok"; trigger: EvolutionTrigger } | GeneralApiProblem