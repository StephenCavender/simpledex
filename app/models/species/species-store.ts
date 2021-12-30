import { Instance, SnapshotOut, types, applySnapshot } from "mobx-state-tree"
import { SpeciesApi } from "../../services/api/species-api"
import { PokemonApi } from "../../services/api/pokemon-api"
import { withEnvironment } from "../extensions/with-environment"
import { SpeciesModel, SpeciesSnapshot, Species } from "./species"

/**
 * Store for holding list of Pokemon species.
 */
export const SpeciesStoreModel = types
  .model("SpeciesStore")
  .props({
    species: types.optional(types.array(SpeciesModel), []),
    selected: types.maybe(types.reference(types.late(() => SpeciesModel)))
  })
  .extend(withEnvironment)
  .actions((self) => ({
    save: (speciesSnapshot: SpeciesSnapshot[]) => {
      self.species.replace(speciesSnapshot)
    },
    setSelected: (species: Species) => {
      self.selected = species
    }
  }))
  .actions((self) => ({
    getAll: async () => {
      const speciesApi = new SpeciesApi(self.environment.api)
      const result = await speciesApi.getAll()

      if (result.kind === "ok") {
        self.save(result.species)
      } else {
        __DEV__ && console.tron.log(result.kind)
      }
    },
    get: async (species: string | number) => {
      const speciesApi = new SpeciesApi(self.environment.api)
      const result = await speciesApi.get(species)

      if (result.kind === "ok") {
        return result.species
      } else {
        __DEV__ && console.tron.log(result.kind)
        throw result
      }
    },
    getPokemon: async (pokemon: string | number) => {
      const pokemonApi = new PokemonApi(self.environment.api)
      const result = await pokemonApi.get(pokemon)

      if (result.kind === "ok") {
        return result.pokemon
      } else {
        __DEV__ && console.tron.log(result.kind)
        throw result
      }
    }
  }))
  .actions((self) => ({
    afterCreate: async () => {
      self.setSelected(undefined)
      await self.getAll()
    },
    select: async (species: string) => {
      try {
        const toSelect = self.species.find(s => s.name === species)
        const toApply = await self.get(species)
        const variety = toApply.varieties.find(variety => variety.is_default)
        variety.pokemon = await self.getPokemon(species)
        applySnapshot(toSelect, toApply)
        self.setSelected(toSelect)
      } catch (error) {
        __DEV__ && console.tron.log(`err: ${error}`)
      }
    }
  }))

type SpeciesStoreType = Instance<typeof SpeciesStoreModel>
export interface SpeciesStore extends SpeciesStoreType {}
type SpeciesStoreSnapshotType = SnapshotOut<typeof SpeciesStoreModel>
export interface SpeciesStoreSnapshot extends SpeciesStoreSnapshotType {}
export const createSpeciesStoreDefaultModel = () => types.optional(SpeciesStoreModel, {})
