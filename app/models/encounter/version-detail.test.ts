import { VersionDetailModel } from "./version-detail"

test("can be created", () => {
  const instance = VersionDetailModel.create({})

  expect(instance).toBeTruthy()
})
