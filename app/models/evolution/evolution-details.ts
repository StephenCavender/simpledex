import { Instance, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const EvolutionDetailsModel = types
  .model("EvolutionDetails")
  .props({})
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

type EvolutionDetailsType = Instance<typeof EvolutionDetailsModel>
export interface EvolutionDetails extends EvolutionDetailsType {}
type EvolutionDetailsSnapshotType = SnapshotOut<typeof EvolutionDetailsModel>
export interface EvolutionDetailsSnapshot extends EvolutionDetailsSnapshotType {}
export const createEvolutionDetailsDefaultModel = () => types.optional(EvolutionDetailsModel, {})
