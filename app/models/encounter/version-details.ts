import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { EncounterDetailModel } from "./encounter-detail"

/**
 * Model description here for TypeScript hints.
 */
export const VersionDetailsModel = types
  .model("VersionDetails")
  .props({
    encounter_details: types.array(EncounterDetailModel),
    max_chance: types.number, // TODO: needed??
    version: types.string
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

type VersionDetailsType = Instance<typeof VersionDetailsModel>
export interface VersionDetails extends VersionDetailsType {}
type VersionDetailsSnapshotType = SnapshotOut<typeof VersionDetailsModel>
export interface VersionDetailsSnapshot extends VersionDetailsSnapshotType {}
export const createVersionDetailsDefaultModel = () => types.optional(VersionDetailsModel, {})
