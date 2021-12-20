import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { PokemonModel } from "./pokemon"

/**
 * Pokemon variety for a given species
 */
export const VarietyModel = types
  .model("Variety")
  .props({
    is_default: types.maybe(types.boolean),
    pokemon: types.maybe(PokemonModel),
  })

type VarietyType = Instance<typeof VarietyModel>
export interface Variety extends VarietyType {}
type VarietySnapshotType = SnapshotOut<typeof VarietyModel>
export interface VarietySnapshot extends VarietySnapshotType {}
export const createVarietyDefaultModel = () => types.optional(VarietyModel, {})
