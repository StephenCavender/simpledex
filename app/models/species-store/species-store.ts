import { Instance, SnapshotOut, types, applySnapshot } from "mobx-state-tree"
import { SpeciesApi } from "../../services/api/species-api"
import { withEnvironment } from "../extensions/with-environment"
import { SpeciesModel, SpeciesSnapshot } from "../species/species"

/**
 * Model description here for TypeScript hints.
 */
export const SpeciesStoreModel = types
  .model("SpeciesStore")
  .props({
    species: types.optional(types.array(SpeciesModel), []),
    selected: types.optional(SpeciesModel, {})
  })
  .extend(withEnvironment)
  .actions((self) => ({
    save: (speciesSnapshot: SpeciesSnapshot[]) => {
      self.species.replace(speciesSnapshot)
    },
  }))
  .actions((self) => ({
    getAll: async () => {
      const speciesApi = new SpeciesApi(self.environment.api)
      const result = await speciesApi.getAll()

      if (result.kind === "ok") {
        self.save(result.species)
      } else {
        __DEV__ && console.tron.log(result.kind)
      }
    },
    get: async (species: string) => {
      const speciesApi = new SpeciesApi(self.environment.api)
      const result = await speciesApi.get(species)

      if (result.kind === "ok") {
        applySnapshot(self.selected, result.species)
      } else {
        __DEV__ && console.tron.log(result.kind)
      }
    }
  }))
  .actions((self) => ({
    select: async (species: string) => {
      await self.get(species)
    }
  }))

type SpeciesStoreType = Instance<typeof SpeciesStoreModel>
export interface SpeciesStore extends SpeciesStoreType {}
type SpeciesStoreSnapshotType = SnapshotOut<typeof SpeciesStoreModel>
export interface SpeciesStoreSnapshot extends SpeciesStoreSnapshotType {}
export const createSpeciesStoreDefaultModel = () => types.optional(SpeciesStoreModel, {})
