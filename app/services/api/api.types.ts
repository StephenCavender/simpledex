import { GeneralApiProblem } from "./api-problem"
import { Species } from "../../models/species/species"
import { Pokemon } from "../../models/pokemon/pokemon"
import { EvolutionLink } from "../../models/evolution/evolution-link"
import { Encounter } from "../../models/encounter/encounter"

// Species
export type GetAllSpeciesResult = { kind: "ok"; species: Species[] } | GeneralApiProblem
export type GetSpeciesResult = { kind: "ok"; species: Species } | GeneralApiProblem

// Pokemon
export type GetPokemonResult = { kind: "ok"; pokemon: Pokemon } | GeneralApiProblem

// Evolution
export type GetEvolutionChainResult = { kind: "ok"; chain: EvolutionLink } | GeneralApiProblem

// Encounter
export type GetEncounterResult = { kind: "ok"; encounters: Encounter[] } | GeneralApiProblem
