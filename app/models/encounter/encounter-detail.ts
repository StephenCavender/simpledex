import { Instance, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const EncounterDetailModel = types
  .model("EncounterDetail")
  .props({
    chance: types.number,
    method: types.string
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

type EncounterDetailType = Instance<typeof EncounterDetailModel>
export interface EncounterDetail extends EncounterDetailType {}
type EncounterDetailSnapshotType = SnapshotOut<typeof EncounterDetailModel>
export interface EncounterDetailSnapshot extends EncounterDetailSnapshotType {}
export const createEncounterDetailDefaultModel = () => types.optional(EncounterDetailModel, {})
