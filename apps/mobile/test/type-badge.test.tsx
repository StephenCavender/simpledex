import { POKEMON_TYPES } from "@simpledex/pokedex";
import { render, screen } from "@testing-library/react-native";

import { TypeBadge } from "@/components/type-badge";

describe("TypeBadge", () => {
  it.each(POKEMON_TYPES)("renders %s with its label, colour token, and icon", async (type) => {
    await render(<TypeBadge type={type} />);

    expect(screen.getByText(type)).toBeOnTheScreen();
    expect(screen.getByTestId(`type-badge-${type}`).props.className).toContain(`bg-type-${type}`);
    expect(
      screen.getByTestId(`type-icon-${type}`, { includeHiddenElements: true }),
    ).toBeOnTheScreen();
  });

  it("falls back to a neutral colour and icon for an unknown Type", async () => {
    await render(<TypeBadge type="stellar" />);

    expect(screen.getByText("stellar")).toBeOnTheScreen();
    expect(screen.getByTestId("type-badge-stellar").props.className).toContain(
      "bg-muted-foreground",
    );
    expect(
      screen.getByTestId("type-icon-unknown", { includeHiddenElements: true }),
    ).toBeOnTheScreen();
  });
});
