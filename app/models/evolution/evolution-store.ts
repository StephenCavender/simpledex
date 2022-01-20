import { Instance, SnapshotOut, types, flow } from "mobx-state-tree"
import { withEnvironment } from "../extensions/with-environment"
import { withRootStore } from "../extensions/with-root-store"
import { EvolutionApi } from "../../services/api/evolution-api"
import { EvolutionLinkModel, EvolutionLinkSnapshot } from "../evolution/evolution-link"

/**
 * Model description here for TypeScript hints.
 */
export const EvolutionStoreModel = types
  .model("EvolutionStore")
  .props({
    evolutions: types.array(EvolutionLinkModel),
  })
  .extend(withEnvironment)
  .extend(withRootStore)
  .actions((self) => ({
    save: flow(function* (evolutions: EvolutionLinkSnapshot[]) {
      yield Promise.all(evolutions.map(flow(function* (evolution) {
        yield self.rootStore.speciesStore.getPokemonData(evolution.species)
      })))
      self.evolutions.replace(evolutions)
    })
  }))
  .actions((self) => ({
    getChain: flow(function* (evolutionChain: number, species: string) {
      const evolutionApi = new EvolutionApi(self.environment.api)
      const result = yield evolutionApi.getChain(evolutionChain, species)

      if (result.kind === "ok") {
        self.save(result.chain)
      } else {
        __DEV__ && console.tron.log(result.kind)
        throw result
      }
    }),
  }))

type EvolutionStoreType = Instance<typeof EvolutionStoreModel>
export interface EvolutionStore extends EvolutionStoreType {}
type EvolutionStoreSnapshotType = SnapshotOut<typeof EvolutionStoreModel>
export interface EvolutionStoreSnapshot extends EvolutionStoreSnapshotType {}
export const createEvolutionStoreDefaultModel = () => types.optional(EvolutionStoreModel, {})
