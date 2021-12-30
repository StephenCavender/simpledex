import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { VarietyModel } from "../pokemon/variety"
import { withEnvironment } from "../extensions/with-environment"

/**
 * A species of Pokemon
 */
export const SpeciesModel = types
  .model("Species")
  .props({
    name: types.identifier,
    id: types.maybe(types.number),
    evolution_chain: types.maybe(types.number),
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

type SpeciesType = Instance<typeof SpeciesModel>
export interface Species extends SpeciesType {}
type SpeciesSnapshotType = SnapshotOut<typeof SpeciesModel>
export interface SpeciesSnapshot extends SpeciesSnapshotType {}
export const createSpeciesDefaultModel = () => types.optional(SpeciesModel, {})
