import { VarietyModel } from "./variety"

test("can be created", () => {
  const instance = VarietyModel.create({})

  expect(instance).toBeTruthy()
})
