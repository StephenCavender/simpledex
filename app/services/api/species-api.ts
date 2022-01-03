import { ApiResponse } from "apisauce"
import { Api } from "./api"
import { GetAllSpeciesResult, GetSpeciesResult } from "./api.types"
import { getGeneralApiProblem } from "./api-problem"

export class SpeciesApi {
  private api: Api

  constructor(api: Api) {
    this.api = api
  }

  async getAll(): Promise<GetAllSpeciesResult> {
    try {
      const countResponse: ApiResponse<any> = await this.api.apisauce.get(
        "/pokemon-species?limit=1",
      )
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `/pokemon-species?limit=${countResponse.data.count}`,
      )

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

      const split = response.data.evolution_chain.url.split("/")

      const resultSpecies: any = {
        ...response.data,
        evolution_chain: parseInt(split[split.length - 2]),
      }

      return { kind: "ok", species: resultSpecies }
    } catch (e) {
      __DEV__ && console.tron.log(e.message)
      return { kind: "bad-data" }
    }
  }
}
