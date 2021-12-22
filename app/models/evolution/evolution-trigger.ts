import { Instance, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const EvolutionTriggerModel = types
  .model("EvolutionTrigger")
  .props({})
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

type EvolutionTriggerType = Instance<typeof EvolutionTriggerModel>
export interface EvolutionTrigger extends EvolutionTriggerType {}
type EvolutionTriggerSnapshotType = SnapshotOut<typeof EvolutionTriggerModel>
export interface EvolutionTriggerSnapshot extends EvolutionTriggerSnapshotType {}
export const createEvolutionTriggerDefaultModel = () => types.optional(EvolutionTriggerModel, {})
