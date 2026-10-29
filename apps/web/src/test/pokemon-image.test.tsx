import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PokemonImage } from "@/components/pokemon-image";

describe("PokemonImage", () => {
  it("renders the image lazily", () => {
    render(<PokemonImage src="https://img/25.png" name="pikachu" size="md" />);

    const img = screen.getByRole("img", { name: "pikachu" });
    expect(img.tagName).toBe("IMG");
    expect(img.getAttribute("src")).toBe("https://img/25.png");
    expect(img.getAttribute("loading")).toBe("lazy");
  });

  it("shows a placeholder when there is no image", () => {
    render(<PokemonImage src={undefined} name="missingno" size="lg" />);

    expect(screen.getByRole("img", { name: "missingno" }).tagName).not.toBe("IMG");
  });

  it("falls back to the placeholder when the image fails to load", () => {
    render(<PokemonImage src="https://img/broken.png" name="pikachu" size="sm" />);

    fireEvent.error(screen.getByRole("img", { name: "pikachu" }));

    expect(screen.getByRole("img", { name: "pikachu" }).tagName).not.toBe("IMG");
  });

  it("tries again when the image source changes", () => {
    const { rerender } = render(
      <PokemonImage src="https://img/broken.png" name="pikachu" size="sm" />,
    );
    fireEvent.error(screen.getByRole("img", { name: "pikachu" }));

    rerender(<PokemonImage src="https://img/26.png" name="raichu" size="sm" />);

    expect(screen.getByRole("img", { name: "raichu" }).getAttribute("src")).toBe(
      "https://img/26.png",
    );
  });
});
