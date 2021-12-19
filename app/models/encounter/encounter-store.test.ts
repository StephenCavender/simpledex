import { EncounterStoreModel } from "./encounter-store"

test("can be created", () => {
  const instance = EncounterStoreModel.create({})

  expect(instance).toBeTruthy()
})
