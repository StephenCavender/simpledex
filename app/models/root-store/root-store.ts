import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { EvolutionStoreModel } from "../evolution/evolution-store"
import { SpeciesStoreModel } from "../species/species-store"
import { EncounterStoreModel } from "../encounter/encounter-store"

/**
 * A RootStore model.
 */
// prettier-ignore
export const RootStoreModel = types.model("RootStore").props({
  speciesStore: types.optional(SpeciesStoreModel, {} as any),
  evolutionStore: types.optional(EvolutionStoreModel, {} as any),
  encounterStore: types.optional(EncounterStoreModel, {} as any)
})

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}

/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
