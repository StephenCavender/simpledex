import { Instance, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const EvolutionDetailsModel = types
  .model("EvolutionDetails")
  .props({
    gender: types.number, // 1 female, 2 male
    held_item: types.string,
    item: types.string,
    known_move: types.string,
    known_move_type: types.string,
    location: types.string,
    min_affection: types.number,
    min_beauty: types.number,
    min_happiness: types.number,
    min_level: types.number,
    needs_overworld_rain: types.boolean, // rainy (or foggy Gen VII) in overworld
    party_species: types.string, // species must be in party
    party_type: types.string, // type must be in party
    relative_physical_stats: types.number, // -1: att < def, 0: att = def, 1: att > def
    time_of_day: types.string, // day, night
    trade_species: types.string,
    turn_updside_down: types.boolean, // turn system upside down (switch handheld mode)
    trigger: types.enumeration("Trigger", ["level-up", "trade", "use-item", "shed", "other"]),
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

type EvolutionDetailsType = Instance<typeof EvolutionDetailsModel>
export interface EvolutionDetails extends EvolutionDetailsType {}
type EvolutionDetailsSnapshotType = SnapshotOut<typeof EvolutionDetailsModel>
export interface EvolutionDetailsSnapshot extends EvolutionDetailsSnapshotType {}
export const createEvolutionDetailsDefaultModel = () => types.optional(EvolutionDetailsModel, {})
