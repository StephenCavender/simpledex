import { Instance, SnapshotOut, types } from "mobx-state-tree"

/**
 * Pokemon game version model
 */
export const VersionModel = types
  .model("Version")
  .props({
    name: types.string
  })

type VersionType = Instance<typeof VersionModel>
export interface Version extends VersionType {}
type VersionSnapshotType = SnapshotOut<typeof VersionModel>
export interface VersionSnapshot extends VersionSnapshotType {}
export const createVersionDefaultModel = () => types.optional(VersionModel, {})
