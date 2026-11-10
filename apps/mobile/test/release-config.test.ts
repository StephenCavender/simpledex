import appJson from "../app.json";
import easJson from "../eas.json";

const profiles = easJson.build;

describe("EAS build profiles", () => {
  it("builds production against the production environment and channel", () => {
    expect(profiles.production).toMatchObject({ environment: "production", channel: "production" });
  });

  // Preview builds are shared with testers, so they must never touch production
  // data: they read the `development` EAS environment, the dev Convex deployment.
  it("builds preview as an internal build against the dev Convex deployment", () => {
    expect(profiles.preview).toMatchObject({
      environment: "development",
      channel: "preview",
      distribution: "internal",
    });
  });
});

describe("EAS Submit", () => {
  // Play only accepts draft releases until the app's first review is complete.
  it("sends production Android builds to Play internal testing as drafts", () => {
    expect(easJson.submit.production.android).toMatchObject({
      track: "internal",
      releaseStatus: "draft",
    });
  });
});

describe("iOS", () => {
  // Supporting iPad would require iPad screenshots in the App Store listing,
  // which can't be taken without an iPad or a Mac. iPads run it as an iPhone app.
  it("is iPhone only", () => {
    expect(appJson.expo.ios.supportsTablet).toBe(false);
  });
});

describe("EAS Update", () => {
  const { expo } = appJson;

  it("matches updates to builds by fingerprint", () => {
    expect(expo.runtimeVersion).toEqual({ policy: "fingerprint" });
  });

  it("is enabled and points at this project's update server", () => {
    expect(expo.updates).toEqual({
      enabled: true,
      url: `https://u.expo.dev/${expo.extra.eas.projectId}`,
    });
  });
});
