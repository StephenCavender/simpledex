import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { EncounterDetailModel } from "./encounter-detail"

/**
 * Details for which version an encounter is for
 */
export const VersionDetailsModel = types
  .model("VersionDetails")
  .props({
    encounter_details: types.array(EncounterDetailModel),
    version: types.string,
  })

type VersionDetailsType = Instance<typeof VersionDetailsModel>
export interface VersionDetails extends VersionDetailsType {}
type VersionDetailsSnapshotType = SnapshotOut<typeof VersionDetailsModel>
export interface VersionDetailsSnapshot extends VersionDetailsSnapshotType {}
export const createVersionDetailsDefaultModel = () => types.optional(VersionDetailsModel, {})
