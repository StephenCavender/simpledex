import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { identity, pickBy } from 'lodash'

/**
 * Model description here for TypeScript hints.
 */
export const EvolutionDetailsModel = types
  .model("EvolutionDetails")
  .props({
    gender: types.maybeNull(types.number), // 1 female, 2 male
    held_item: types.maybeNull(types.string),
    item: types.maybeNull(types.string),
    known_move: types.maybeNull(types.string),
    known_move_type: types.maybeNull(types.string),
    location: types.maybeNull(types.string),
    min_affection: types.maybeNull(types.number),
    min_beauty: types.maybeNull(types.number),
    min_happiness: types.maybeNull(types.number),
    min_level: types.maybeNull(types.number),
    needs_overworld_rain: types.maybeNull(types.boolean), // rainy (or foggy Gen VII) in overworld
    party_species: types.maybeNull(types.string), // species must be in party
    party_type: types.maybeNull(types.string), // type must be in party
    relative_physical_stats: types.maybeNull(types.number), // -1: att < def, 0: att = def, 1: att > def
    time_of_day: types.maybeNull(types.string), // day, night
    trade_species: types.maybeNull(types.string),
    turn_updside_down: types.maybeNull(types.boolean), // turn system upside down (switch handheld mode)
    trigger: types.enumeration<string>(["level-up", "trade", "use-item", "shed", "other"]),
  })
  .views((self) => ({
    clean: () => {
      return pickBy(self, identity)
    }
  }))

type EvolutionDetailsType = Instance<typeof EvolutionDetailsModel>
export interface EvolutionDetails extends EvolutionDetailsType {}
type EvolutionDetailsSnapshotType = SnapshotOut<typeof EvolutionDetailsModel>
export interface EvolutionDetailsSnapshot extends EvolutionDetailsSnapshotType {}
export const createEvolutionDetailsDefaultModel = () => types.optional(EvolutionDetailsModel, {})
