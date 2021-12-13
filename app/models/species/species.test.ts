import { SpeciesModel } from "./species"

test("can be created", () => {
  const instance = SpeciesModel.create({})

  expect(instance).toBeTruthy()
})
