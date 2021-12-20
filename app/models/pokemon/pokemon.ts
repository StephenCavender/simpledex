import { Instance, SnapshotOut, types, applySnapshot } from "mobx-state-tree"
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
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    afterCreate: async () => {
      console.tron.log('pokemon afterCreate called')
      const pokemonApi = new PokemonApi(self.environment.api)
      const result = await pokemonApi.get(self.id)

      if (result.kind === "ok") {
        applySnapshot(self, result.pokemon)
      } else {
        __DEV__ && console.tron.log(result.kind)
      }
    }
  }))

type PokemonType = Instance<typeof PokemonModel>
export interface Pokemon extends PokemonType {}
type PokemonSnapshotType = SnapshotOut<typeof PokemonModel>
export interface PokemonSnapshot extends PokemonSnapshotType {}
export const createPokemonDefaultModel = () => types.optional(PokemonModel, {})
