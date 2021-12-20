import { ApiResponse } from "apisauce"
import { Api } from "./api"
import { GetPokemonResult } from "./api.types"
import { getGeneralApiProblem } from "./api-problem"

export class PokemonApi {
  private api: Api

  constructor(api: Api) {
    this.api = api
  }

  async get(pokemon: string | number): Promise<GetPokemonResult> {
    try {
      const response: ApiResponse<any> = await this.api.apisauce.get(`/pokemon/${pokemon}`)

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", pokemon: response.data }
    } catch (e) {
      __DEV__ && console.tron.log(e.message)
      return { kind: "bad-data" }
    }
  }
}
