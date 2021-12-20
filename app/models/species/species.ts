import { Instance, SnapshotOut, types, applySnapshot } from "mobx-state-tree"
import { SpeciesApi } from "../../services/api/species-api"
import { EvolutionChainModel } from "../evolution/evolution-chain"
import { VarietyModel } from "../pokemon/variety"
import { withEnvironment } from "../extensions/with-environment"

/**
 * A species of Pokemon
 */
export const SpeciesModel = types
  .model("Species")
  .props({
    id: types.maybe(types.number),
    name: types.maybe(types.string),
    evolution_chain: types.maybe(EvolutionChainModel),
    varieties: types.maybe(types.array(VarietyModel)),
  })
  .extend(withEnvironment)
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
    },
  }))
  .actions((self) => ({
    get: async (species: string | number) => {
      const speciesApi = new SpeciesApi(self.environment.api)
      const result = await speciesApi.get(species)

      if (result.kind === "ok") {
        applySnapshot(self, result.species)
      } else {
        __DEV__ && console.tron.log(result.kind)
      }
    }
  }))

type SpeciesType = Instance<typeof SpeciesModel>
export interface Species extends SpeciesType {}
type SpeciesSnapshotType = SnapshotOut<typeof SpeciesModel>
export interface SpeciesSnapshot extends SpeciesSnapshotType {}
export const createSpeciesDefaultModel = () => types.optional(SpeciesModel, {})
