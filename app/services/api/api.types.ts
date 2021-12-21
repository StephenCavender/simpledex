import { GeneralApiProblem } from "./api-problem"
import { Species } from "../../models/species/species"
import { Pokemon } from "../../models/pokemon/pokemon"

export interface User {
  id: number
  name: string
}

export type GetUsersResult = { kind: "ok"; users: User[] } | GeneralApiProblem
export type GetUserResult = { kind: "ok"; user: User } | GeneralApiProblem

export type GetAllSpeciesResult = { kind: "ok"; species: Species[] } | GeneralApiProblem
export type GetSpeciesResult = { kind: "ok"; species: Species } | GeneralApiProblem
export type GetPokemonResult = { kind: "ok"; pokemon: Pokemon } | GeneralApiProblem
