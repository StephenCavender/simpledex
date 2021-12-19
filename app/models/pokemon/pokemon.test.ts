import { PokemonModel } from "./pokemon"

test("can be created", () => {
  const instance = PokemonModel.create({})

  expect(instance).toBeTruthy()
})
