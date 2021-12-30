import { EvolutionStoreModel } from "./evolution-store"

test("can be created", () => {
  const instance = EvolutionStoreModel.create({})

  expect(instance).toBeTruthy()
})
