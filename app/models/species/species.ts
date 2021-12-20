import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { EvolutionChainModel } from "../evolution/evolution-chain"
import { VarietyModel } from "../pokemon/variety"

/**
 * Model description here for TypeScript hints.
 */
export const SpeciesModel = types
  .model("Species")
  .props({
    id: types.maybe(types.number),
    name: types.maybe(types.string),
    evolution_chain: types.maybe(EvolutionChainModel),
    varieties: types.maybe(types.array(VarietyModel)),
  })
  .views((self) => ({
    evolvesTo: async () => {
      // TODO: return array of species this can evolve to

      // const speciesApi = new SpeciesApi(self.environment.api)
      // const result = await speciesApi.getAll()

      // if (result.kind === "ok") {
      //   self.save(result.species)
      // } else {
      //   __DEV__ && console.tron.log(result.kind)
      // }
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

type SpeciesType = Instance<typeof SpeciesModel>
export interface Species extends SpeciesType {}
type SpeciesSnapshotType = SnapshotOut<typeof SpeciesModel>
export interface SpeciesSnapshot extends SpeciesSnapshotType {}
export const createSpeciesDefaultModel = () => types.optional(SpeciesModel, {})
