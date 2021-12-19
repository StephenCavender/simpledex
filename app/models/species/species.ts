import { Instance, SnapshotOut, types } from "mobx-state-tree"

const EvolutionChainModel = types
  .model("EvolutionChain")
  .props({
    url: types.maybe(types.string)
  })

/**
 * Model description here for TypeScript hints.
 */
export const SpeciesModel = types
  .model("Species")
  .props({
    // id
    name: types.maybe(types.string),
    evolution_chain: types.maybe(EvolutionChainModel),
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
