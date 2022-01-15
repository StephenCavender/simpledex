import { VersionStoreModel } from "./version-store"

test("can be created", () => {
  const instance = VersionStoreModel.create({})

  expect(instance).toBeTruthy()
})
