import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { EvolutionDetailsModel } from "./evolution-details"
import { SpeciesModel } from "../species/species"

/**
 * Model description here for TypeScript hints.
 */
export const EvolutionLinkModel = types.model("EvolutionLink").props({
  evolution_details: types.array(EvolutionDetailsModel),
  evolves_to: types.optional(types.array(types.late(() => EvolutionLinkModel)), []),
  species: types.maybe(types.reference(types.late(() => SpeciesModel))),
})

type EvolutionLinkType = Instance<typeof EvolutionLinkModel>
export interface EvolutionLink extends EvolutionLinkType {}
type EvolutionLinkSnapshotType = SnapshotOut<typeof EvolutionLinkModel>
export interface EvolutionLinkSnapshot extends EvolutionLinkSnapshotType {}
export const createEvolutionLinkDefaultModel = () => types.optional(EvolutionLinkModel, {})
