import { EvolutionTriggerModel } from "./evolution-trigger"

test("can be created", () => {
  const instance = EvolutionTriggerModel.create({})

  expect(instance).toBeTruthy()
})
