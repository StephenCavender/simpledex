import { Instance, SnapshotOut, types, flow } from "mobx-state-tree"
import { withEnvironment } from "../extensions/with-environment"
import { EncounterModel, EncounterSnapshot } from "./encounter"
import { EncounterApi } from "../../services/api/encounter-api"

/**
 * Store for pokemon encounters
 */
export const EncounterStoreModel = types
  .model("EncounterStore")
  .props({
    encounters: types.array(EncounterModel),
  })
  .extend(withEnvironment)
  .actions((self) => ({
    save: (encounterSnapshot: EncounterSnapshot[]) => {
      self.encounters.replace(encounterSnapshot)
    }
  }))
  .actions((self) => ({
    get: flow(function* (pokemon: string | number) {
      const encounterApi = new EncounterApi(self.environment.api)
      const result = yield encounterApi.get(pokemon)

      if (result.kind === "ok") {
        self.save(result.encounters)
      } else {
        __DEV__ && console.tron.log(result.kind)
        throw result
      }
    })
  }))

type EncounterStoreType = Instance<typeof EncounterStoreModel>
export interface EncounterStore extends EncounterStoreType {}
type EncounterStoreSnapshotType = SnapshotOut<typeof EncounterStoreModel>
export interface EncounterStoreSnapshot extends EncounterStoreSnapshotType {}
export const createEncounterStoreDefaultModel = () => types.optional(EncounterStoreModel, {})
