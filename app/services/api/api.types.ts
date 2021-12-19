import { GeneralApiProblem } from "./api-problem"
import { Species } from "../../models/species/species"

export interface User {
  id: number
  name: string
}

export type GetUsersResult = { kind: "ok"; users: User[] } | GeneralApiProblem
export type GetUserResult = { kind: "ok"; user: User } | GeneralApiProblem

export type GetSpeciesResult = { kind: "ok"; species: Species[] } | GeneralApiProblem
