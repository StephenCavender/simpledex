import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { VersionDetailModel } from "./version-detail"

/**
 * A pokemon encounter
 */
export const EncounterModel = types
  .model("Encounter")
  .props({
    location_area: types.string,
    version_details: types.array(VersionDetailModel),
  })

type EncounterType = Instance<typeof EncounterModel>
export interface Encounter extends EncounterType {}
type EncounterSnapshotType = SnapshotOut<typeof EncounterModel>
export interface EncounterSnapshot extends EncounterSnapshotType {}
export const createEncounterDefaultModel = () => types.optional(EncounterModel, {})
