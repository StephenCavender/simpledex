import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { SpeciesApi } from "../../services/api/species-api"
import { withEnvironment } from "../extensions/with-environment"
import { SpeciesModel, SpeciesSnapshot } from "../species/species"

/**
 * Model description here for TypeScript hints.
 */
export const SpeciesStoreModel = types
  .model("SpeciesStore")
  .props({
    species: types.optional(types.array(SpeciesModel), [])
  })
  .extend(withEnvironment)
  .actions((self) => ({
    save: (speciesSnapshot: SpeciesSnapshot[]) => {
      self.species.replace(speciesSnapshot)
    },
  }))
  .actions((self) => ({
    get: async () => {
      const speciesApi = new SpeciesApi(self.environment.api)
      const result = await speciesApi.getSpecies()

      if (result.kind === "ok") {
        self.save(result.species)
      } else {
        __DEV__ && console.tron.log(result.kind)
      }
    },
  }))

type SpeciesStoreType = Instance<typeof SpeciesStoreModel>
export interface SpeciesStore extends SpeciesStoreType {}
type SpeciesStoreSnapshotType = SnapshotOut<typeof SpeciesStoreModel>
export interface SpeciesStoreSnapshot extends SpeciesStoreSnapshotType {}
export const createSpeciesStoreDefaultModel = () => types.optional(SpeciesStoreModel, {})
