import { EvolutionChainModel } from "./evolution-chain"

test("can be created", () => {
  const instance = EvolutionChainModel.create({})

  expect(instance).toBeTruthy()
})
