import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { PokemonModel } from "./pokemon"

/**
 * Model description here for TypeScript hints.
 */
export const VarietyModel = types
  .model("Variety")
  .props({
    is_default: types.maybe(types.boolean),
    pokemon: types.maybe(PokemonModel),
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

type VarietyType = Instance<typeof VarietyModel>
export interface Variety extends VarietyType {}
type VarietySnapshotType = SnapshotOut<typeof VarietyModel>
export interface VarietySnapshot extends VarietySnapshotType {}
export const createVarietyDefaultModel = () => types.optional(VarietyModel, {})
