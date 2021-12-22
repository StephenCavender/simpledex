import { ApiResponse } from "apisauce"
import { Api } from "./api"
import { getGeneralApiProblem } from "./api-problem"
import { GetEvolutionChainResult, GetEvolutionTriggerResult } from "."

export class EvolutionApi {
  private api: Api

  constructor(api: Api) {
    this.api = api
  }

  async getChain(id: number): Promise<GetEvolutionChainResult> {
    try {
      const response: ApiResponse<any> = await this.api.apisauce.get(`/evolution-chain/${id}`)

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", chain: response.data }
    } catch (e) {
      __DEV__ && console.tron.log(e.message)
      return { kind: "bad-data" }
    }
  }

  async getTrigger(trigger: string | number): Promise<GetEvolutionTriggerResult> {
    try {
      const response: ApiResponse<any> = await this.api.apisauce.get(`/evolution-trigger/${trigger}`)

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", trigger: response.data }
    } catch (e) {
      __DEV__ && console.tron.log(e.message)
      return { kind: "bad-data" }
    }
  }
}
