import { Instance, SnapshotOut, types } from "mobx-state-tree"

/**
 * Details for a pokemon encounter
 */
export const EncounterDetailModel = types
  .model("EncounterDetail")
  .props({
    chance: types.number,
    condition_values: types.array(types.string),
    method: types.string,
  })

type EncounterDetailType = Instance<typeof EncounterDetailModel>
export interface EncounterDetail extends EncounterDetailType {}
type EncounterDetailSnapshotType = SnapshotOut<typeof EncounterDetailModel>
export interface EncounterDetailSnapshot extends EncounterDetailSnapshotType {}
export const createEncounterDetailDefaultModel = () => types.optional(EncounterDetailModel, {})
