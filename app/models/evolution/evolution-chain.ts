import { Instance, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const EvolutionChainModel = types
  .model("EvolutionChain")
  .props({})
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

type EvolutionChainType = Instance<typeof EvolutionChainModel>
export interface EvolutionChain extends EvolutionChainType {}
type EvolutionChainSnapshotType = SnapshotOut<typeof EvolutionChainModel>
export interface EvolutionChainSnapshot extends EvolutionChainSnapshotType {}
export const createEvolutionChainDefaultModel = () => types.optional(EvolutionChainModel, {})
