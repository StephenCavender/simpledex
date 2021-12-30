import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { VersionDetailsModel } from "./version-details"

/**
 * Model description here for TypeScript hints.
 */
export const EncounterModel = types
  .model("Encounter")
  .props({
    location_area: types.string,
    version_details: types.array(VersionDetailsModel)
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

type EncounterType = Instance<typeof EncounterModel>
export interface Encounter extends EncounterType {}
type EncounterSnapshotType = SnapshotOut<typeof EncounterModel>
export interface EncounterSnapshot extends EncounterSnapshotType {}
export const createEncounterDefaultModel = () => types.optional(EncounterModel, {})
