import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { EncounterDetailModel } from "./encounter-detail"

/**
 * Details for which version an encounter is for
 */
export const VersionDetailModel = types.model("VersionDetail").props({
  encounter_details: types.array(EncounterDetailModel),
  version: types.string,
})

type VersionDetailType = Instance<typeof VersionDetailModel>
export interface VersionDetail extends VersionDetailType {}
type VersionDetailSnapshotType = SnapshotOut<typeof VersionDetailModel>
export interface VersionDetailSnapshot extends VersionDetailSnapshotType {}
export const createVersionDetailDefaultModel = () => types.optional(VersionDetailModel, {})
