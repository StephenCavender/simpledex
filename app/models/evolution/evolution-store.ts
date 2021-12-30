import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { withEnvironment } from "../extensions/with-environment"
import { EvolutionApi } from "../../services/api/evolution-api"
import { EvolutionLinkModel, EvolutionLinkSnapshot } from "../evolution/evolution-link"

/**
 * Model description here for TypeScript hints.
 */
export const EvolutionStoreModel = types
  .model("EvolutionStore")
  .props({
    evolutions: types.array(EvolutionLinkModel)
  })
  .extend(withEnvironment)
  .actions((self) => ({
    save: (evolutionLinkSnapshot: EvolutionLinkSnapshot[]) => {
      self.evolutions.replace(evolutionLinkSnapshot)
    },
  }))
  .actions((self) => ({
    getChain: async (evolutionChain: number, species: string) => {
      const evolutionApi = new EvolutionApi(self.environment.api)
      const result = await evolutionApi.getChain(evolutionChain, species)

      if (result.kind === "ok") {
        self.save(result.chain)
      } else {
        __DEV__ && console.tron.log(result.kind)
        throw result
      }
    },
  }))

type EvolutionStoreType = Instance<typeof EvolutionStoreModel>
export interface EvolutionStore extends EvolutionStoreType {}
type EvolutionStoreSnapshotType = SnapshotOut<typeof EvolutionStoreModel>
export interface EvolutionStoreSnapshot extends EvolutionStoreSnapshotType {}
export const createEvolutionStoreDefaultModel = () => types.optional(EvolutionStoreModel, {})
