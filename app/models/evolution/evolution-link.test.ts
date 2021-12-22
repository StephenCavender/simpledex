import { EvolutionLinkModel } from "./evolution-link"

test("can be created", () => {
  const instance = EvolutionLinkModel.create({})

  expect(instance).toBeTruthy()
})
