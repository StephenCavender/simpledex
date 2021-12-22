import { GeneralApiProblem } from "./api-problem"
import { Species } from "../../models/species/species"
import { Pokemon } from "../../models/pokemon/pokemon"

// Species
export type GetAllSpeciesResult = { kind: "ok"; species: Species[] } | GeneralApiProblem
export type GetSpeciesResult = { kind: "ok"; species: Species } | GeneralApiProblem

// Pokemon
export type GetPokemonResult = { kind: "ok"; pokemon: Pokemon } | GeneralApiProblem