import { Instance, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const EvolutionLinkModel = types
  .model("EvolutionLink")
  .props({
    evolution_details: types.array(EvolutionDetailsModel),
    evolves_to: types.array(EvolutionLinkModel),
    species: types.maybe(SpeciesModel)
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

type EvolutionLinkType = Instance<typeof EvolutionLinkModel>
export interface EvolutionLink extends EvolutionLinkType {}
type EvolutionLinkSnapshotType = SnapshotOut<typeof EvolutionLinkModel>
export interface EvolutionLinkSnapshot extends EvolutionLinkSnapshotType {}
export const createEvolutionLinkDefaultModel = () => types.optional(EvolutionLinkModel, {})
