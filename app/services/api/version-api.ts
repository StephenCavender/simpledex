import { ApiResponse } from "apisauce"
import { Api } from "./api"
import { GetAllVersionsResult } from "./api.types"
import { getGeneralApiProblem } from "./api-problem"

export class VersionApi {
  private api: Api

  constructor(api: Api) {
    this.api = api
  }

  async getAll(): Promise<GetAllVersionsResult> {
    try {
      const countResponse: ApiResponse<any> = await this.api.apisauce.get("/version?limit=1")
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `/version?limit=${countResponse.data.count}`,
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      const versions = response.data.results

      return { kind: "ok", versions }
    } catch (e) {
      __DEV__ && console.tron.log(e.message)
      return { kind: "bad-data" }
    }
  }
}
