import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { SpriteModel } from "../sprite/sprite"

/**
 * Model description here for TypeScript hints.
 */
export const PokemonModel = types
  .model("Pokemon")
  .props({
    name: types.maybe(types.string),
    location_area_encounters: types.maybe(types.string),
    sprites: types.maybe(SpriteModel),
    url: types.maybe(types.string)
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

type PokemonType = Instance<typeof PokemonModel>
export interface Pokemon extends PokemonType {}
type PokemonSnapshotType = SnapshotOut<typeof PokemonModel>
export interface PokemonSnapshot extends PokemonSnapshotType {}
export const createPokemonDefaultModel = () => types.optional(PokemonModel, {})
