import { beforeAll } from "vitest";

// Declare ambient used by React testing environment to satisfy TS typings
declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});
