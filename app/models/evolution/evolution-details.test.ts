import { EvolutionDetailsModel } from "./evolution-details"

test("can be created", () => {
  const instance = EvolutionDetailsModel.create({})

  expect(instance).toBeTruthy()
})
