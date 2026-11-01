import { render, screen } from "@testing-library/react-native";
import { useQuery } from "convex/react";

import PokedexScreen from "@/app/index";

jest.mock("convex/react", () => ({ useQuery: jest.fn() }));

const mockUseQuery = jest.mocked(useQuery);

describe("PokedexScreen", () => {
  it("shows how many Pokédex entries Convex returned", async () => {
    mockUseQuery.mockReturnValue([{ id: 1 }, { id: 4 }, { id: 7 }]);

    await render(<PokedexScreen />);

    expect(screen.getByText("3")).toBeOnTheScreen();
    expect(screen.getByText("Pokédex entries")).toBeOnTheScreen();
  });

  it("shows a placeholder while the query is loading", async () => {
    mockUseQuery.mockReturnValue(undefined);

    await render(<PokedexScreen />);

    expect(screen.getByText("…")).toBeOnTheScreen();
  });
});
