import { EncounterModel } from "./encounter"

test("can be created", () => {
  const instance = EncounterModel.create({})

  expect(instance).toBeTruthy()
})
