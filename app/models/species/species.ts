import { Instance, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const SpeciesModel = types
  .model("Species")
  .props({
    id: types.maybe(types.identifierNumber),
    name: types.maybe(types.string),
    evolution_chain: types.maybe(types.string),
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

type SpeciesType = Instance<typeof SpeciesModel>
export interface Species extends SpeciesType {}
type SpeciesSnapshotType = SnapshotOut<typeof SpeciesModel>
export interface SpeciesSnapshot extends SpeciesSnapshotType {}
export const createSpeciesDefaultModel = () => types.optional(SpeciesModel, {})
