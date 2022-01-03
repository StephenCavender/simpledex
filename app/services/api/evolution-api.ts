import { ApiResponse } from "apisauce"
import { Api } from "./api"
import { getGeneralApiProblem } from "./api-problem"
import { GetEvolutionChainResult } from "./api-types"

const recurseEvolutions = (name: string, chain: GetEvolutionChainResult): any => {
  if (name.toLowerCase() !== chain.species.name.toLowerCase()) {
    return recurseEvolutions(name, chain.evolves_to[0])
  }
  chain.evolves_to.forEach((evolution) => {
    evolution.evolution_details.forEach((details) => {
      details.trigger = details.trigger.name
      if (details.item) details.item = details.item.name
      if (details.held_item) details.held_item = details.held_item.name
      if (details.known_move) details.known_move = details.known_move.name
      if (details.known_move_type) details.known_move_type = details.known_move_type.name
      if (details.location) details.location = details.location.name
      if (details.party_species) details.party_species = details.party_species.name
      if (details.party_type) details.party_type = details.party_type.name
      if (details.trade_species) details.trade_species = details.trade_species.name
    })
    evolution.evolves_to = []
    evolution.species = evolution.species.name
  })
  return chain.evolves_to
}

export class EvolutionApi {
  private api: Api

  constructor(api: Api) {
    this.api = api
  }

  async getChain(id: number, species: string): Promise<GetEvolutionChainResult> {
    try {
      const response: ApiResponse<any> = await this.api.apisauce.get(`/evolution-chain/${id}`)

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      const chain = recurseEvolutions(species, response.data.chain)

      return { kind: "ok", chain }
    } catch (e) {
      __DEV__ && console.tron.log(e.message)
      return { kind: "bad-data" }
    }
  }
}
