import { fireEvent, render, screen } from "@testing-library/react-native";

import { PokemonImage } from "@/components/pokemon-image";
import * as screenshotMode from "@/lib/screenshot-mode";

describe("PokemonImage", () => {
  afterEach(() => jest.restoreAllMocks());

  it("shows the artwork", async () => {
    await render(<PokemonImage src="https://example.com/25.png" name="pikachu" size={64} />);

    expect(screen.getByLabelText("pikachu")).toBeOnTheScreen();
    expect(screen.queryByTestId("pokemon-image-placeholder")).not.toBeOnTheScreen();
  });

  it("shows a placeholder when there is no artwork", async () => {
    await render(<PokemonImage src={undefined} name="pikachu" size={64} />);

    expect(screen.getByTestId("pokemon-image-placeholder")).toBeOnTheScreen();
    expect(screen.getByLabelText("pikachu")).toBeOnTheScreen();
  });

  it("shows a placeholder at the same size when the artwork fails to load", async () => {
    await render(<PokemonImage src="https://example.com/broken.png" name="pikachu" size={64} />);

    await fireEvent(screen.getByLabelText("pikachu"), "error", { nativeEvent: { error: "404" } });

    expect(screen.getByTestId("pokemon-image-placeholder")).toHaveStyle({ width: 64, height: 64 });
  });

  it("obscures the artwork in screenshot mode", async () => {
    jest.spyOn(screenshotMode, "isScreenshotMode").mockReturnValue(true);

    await render(<PokemonImage src="https://example.com/25.png" name="pikachu" size={64} />);

    expect(screen.getByLabelText("pikachu")).toBe(screen.getByTestId("pokemon-image-obscured"));
    expect(screen.getByTestId("pokemon-image-obscured")).toHaveStyle({ width: 64, height: 64 });
  });

  it("doesn't obscure the artwork outside screenshot mode", async () => {
    await render(<PokemonImage src="https://example.com/25.png" name="pikachu" size={64} />);

    expect(screen.queryByTestId("pokemon-image-obscured")).not.toBeOnTheScreen();
  });
});
