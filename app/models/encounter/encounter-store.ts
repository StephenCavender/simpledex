import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { EncounterModel } from "./encounter"

/**
 * Store for pokemon encounters
 */
export const EncounterStoreModel = types
  .model("EncounterStore")
  .props({
    encounters: types.array(EncounterModel)
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

type EncounterStoreType = Instance<typeof EncounterStoreModel>
export interface EncounterStore extends EncounterStoreType {}
type EncounterStoreSnapshotType = SnapshotOut<typeof EncounterStoreModel>
export interface EncounterStoreSnapshot extends EncounterStoreSnapshotType {}
export const createEncounterStoreDefaultModel = () => types.optional(EncounterStoreModel, {})
