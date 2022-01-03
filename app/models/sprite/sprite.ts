import { Instance, SnapshotOut, types } from "mobx-state-tree"

/**
 * Image properties for a pokemon
 */
export const SpriteModel = types
  .model("Sprite")
  .props({
    front_default: types.maybe(types.string),
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

type SpriteType = Instance<typeof SpriteModel>
export interface Sprite extends SpriteType {}
type SpriteSnapshotType = SnapshotOut<typeof SpriteModel>
export interface SpriteSnapshot extends SpriteSnapshotType {}
export const createSpriteDefaultModel = () => types.optional(SpriteModel, {})
