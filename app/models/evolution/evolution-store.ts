import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { EvolutionLinkModel } from "../evolution/evolution-link"

/**
 * Model description here for TypeScript hints.
 */
export const EvolutionStoreModel = types
  .model("EvolutionStore")
  .props({
    evolutions: types.array(EvolutionLinkModel)
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

type EvolutionStoreType = Instance<typeof EvolutionStoreModel>
export interface EvolutionStore extends EvolutionStoreType {}
type EvolutionStoreSnapshotType = SnapshotOut<typeof EvolutionStoreModel>
export interface EvolutionStoreSnapshot extends EvolutionStoreSnapshotType {}
export const createEvolutionStoreDefaultModel = () => types.optional(EvolutionStoreModel, {})
