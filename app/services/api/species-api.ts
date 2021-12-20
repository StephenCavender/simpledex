import { ApiResponse } from "apisauce"
import { Api } from "./api"
import { GetSpeciesResult } from "./api.types"
import { getGeneralApiProblem } from "./api-problem"

export class SpeciesApi {
  private api: Api

  constructor(api: Api) {
    this.api = api
  }

  async getAll(): Promise<GetSpeciesResult> {
    try {
      const response: ApiResponse<any> = await this.api.apisauce.get("/pokemon-species?limit=-1")

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      const species = response.data.results

      return { kind: "ok", species }
    } catch (e) {
      __DEV__ && console.tron.log(e.message)
      return { kind: "bad-data" }
    }
  }

  async get(species: string | number): Promise<GetSpeciesResult> {
    try {
      const response: ApiResponse<any> = await this.api.apisauce.get(`/pokemon-species/${species}`)

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", species: response.data }
    } catch (e) {
      __DEV__ && console.tron.log(e.message)
      return { kind: "bad-data" }
    }
  }
}
