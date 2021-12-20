import { SpriteModel } from "./sprite"

test("can be created", () => {
  const instance = SpriteModel.create({})

  expect(instance).toBeTruthy()
})
