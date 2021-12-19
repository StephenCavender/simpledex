import { SpeciesStoreModel } from "./species-store"

test("can be created", () => {
  const instance = SpeciesStoreModel.create({})

  expect(instance).toBeTruthy()
})
