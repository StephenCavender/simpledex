import { VersionDetailsModel } from "./version-details"

test("can be created", () => {
  const instance = VersionDetailsModel.create({})

  expect(instance).toBeTruthy()
})
