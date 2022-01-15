import { Instance, SnapshotOut, types, flow } from "mobx-state-tree"
import { withEnvironment } from "../extensions/with-environment"
import { VersionModel, VersionSNapshot } from "./version"
import { VersionApi } from "../../services/api/version-api"

/**
 * Store for game versions
 */
export const VersionStoreModel = types
  .model("VersionStore")
  .props({
    versions: types.optional(types.array(VersionModel), []),
  })
  .extend(withEnvironment)
  .actions((self) => ({
    save: (versionSnapshot: VersionSnapshot[]) => {
      self.versions.replace(versionSnapshot)
    }
  }))
  .actions((self) => ({
    getAll: flow(function* () {
      const versionApi = new VersionApi(self.environment.api)
      const result = yield versionApi.getAll()

      if (result.kind === "ok") {
        self.save(result.versions)
      } else {
        __DEV__ && console.tron.log(result.kind)
      }
    })
  }))
  .actions((self) => ({
    afterCreate: flow(function* () {
      yield self.getAll()
    })
  }))

type VersionStoreType = Instance<typeof VersionStoreModel>
export interface VersionStore extends VersionStoreType {}
type VersionStoreSnapshotType = SnapshotOut<typeof VersionStoreModel>
export interface VersionStoreSnapshot extends VersionStoreSnapshotType {}
export const createVersionStoreDefaultModel = () => types.optional(VersionStoreModel, {})
