import { ApiResponse } from "apisauce"
import { Api } from "./api"
import { getGeneralApiProblem } from "./api-problem"
import { GetEncounterResult } from "./api-types"

export class EncounterApi {
  private api: Api

  constructor(api: Api) {
    this.api = api
  }

  async get(pokemon: string | number): Promise<GetEncounterResult> {
    try {
      const response: ApiResponse<any> = await this.api.apisauce.get(`pokemon/${pokemon}/encounters`)

      const convert = (encounter: Encounter) => {
        encounter.location_area = encounter.location_area.name
        encounter.version_details.forEach(versionDetail => {
          versionDetail.version = versionDetail.version.name
          versionDetail.encounter_details.forEach(encounterDetail => {
            encounterDetail.method = encounterDetail.method.name
          })
        })

        return encounter
      }

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      const rawEncounters = response.data
      const convertedEncounters: Encounter[] = rawEncounters.map(convert)
      console.tron.log('baz', convertedEncounters)

      return { kind: "ok", encounters: convertedEncounters }
    } catch (e) {
      __DEV__ && console.tron.log(e.message)
      return { kind: "bad-data" }
    }
  }
}