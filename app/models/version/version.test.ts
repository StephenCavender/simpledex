import { VersionModel } from "./version"

test("can be created", () => {
  const instance = VersionModel.create({})

  expect(instance).toBeTruthy()
})
