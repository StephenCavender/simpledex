import { EncounterDetailModel } from "./encounter-detail"

test("can be created", () => {
  const instance = EncounterDetailModel.create({})

  expect(instance).toBeTruthy()
})
