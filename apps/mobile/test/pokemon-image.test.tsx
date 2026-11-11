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

  // The blur is measured in the image's own pixels, so a small sprite needs less of it than
  // full-size artwork to look the same; a fixed radius washed sprites out to dark circles.
  it.each([
    [475, 158],
    [96, 32],
  ])(
    "in screenshot mode, blurs a %ipx-wide image by a third of its width",
    async (width, radius) => {
      jest.spyOn(screenshotMode, "isScreenshotMode").mockReturnValue(true);
      await render(<PokemonImage src="https://example.com/25.png" name="pikachu" size={64} />);
      const image = screen.getByTestId("pokemon-image-blurred");

      // Hidden until it's loaded and its size is known, so it never shows unblurred.
      expect(image).toHaveStyle({ opacity: 0 });

      await fireEvent(image, "load", { nativeEvent: { source: { width, height: width } } });

      expect(image).toHaveProp("blurRadius", radius);
      expect(image).not.toHaveStyle({ opacity: 0 });
    },
  );

  it("doesn't obscure the artwork outside screenshot mode", async () => {
    await render(<PokemonImage src="https://example.com/25.png" name="pikachu" size={64} />);

    expect(screen.queryByTestId("pokemon-image-obscured")).not.toBeOnTheScreen();
  });
});
