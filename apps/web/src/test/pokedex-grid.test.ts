import { describe, expect, it } from "vitest";
import { toRows } from "@/components/pokedex-grid";

describe("toRows", () => {
  it("splits items into rows of the column count", () => {
    expect(toRows([1, 2, 3, 4, 5, 6, 7, 8], 4)).toEqual([
      [1, 2, 3, 4],
      [5, 6, 7, 8],
    ]);
  });

  it("leaves a short last row", () => {
    expect(toRows([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("returns no rows for no items", () => {
    expect(toRows([], 3)).toEqual([]);
  });
});
