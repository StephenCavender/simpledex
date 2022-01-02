import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { VarietyModel } from "../pokemon/variety"

/**
 * A species of Pokemon
 */
export const SpeciesModel = types
  .model("Species")
  .props({
    name: types.identifier,
    id: types.maybe(types.number),
    evolution_chain: types.maybe(types.number),
    varieties: types.maybe(types.array(VarietyModel)),
  })

type SpeciesType = Instance<typeof SpeciesModel>
export interface Species extends SpeciesType {}
type SpeciesSnapshotType = SnapshotOut<typeof SpeciesModel>
export interface SpeciesSnapshot extends SpeciesSnapshotType {}
export const createSpeciesDefaultModel = () => types.optional(SpeciesModel, {})
