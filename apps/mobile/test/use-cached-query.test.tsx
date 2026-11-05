import { api } from "@simpledex/backend/convex/_generated/api";
import { renderHook } from "@testing-library/react-native";
import { useConvexConnectionState, useQuery } from "convex/react";
import Storage from "expo-sqlite/kv-store";

import { useCachedQuery } from "@/lib/use-cached-query";

jest.mock("convex/react", () => ({ useQuery: jest.fn(), useConvexConnectionState: jest.fn() }));

// An in-memory key-value store in place of SQLite.
jest.mock("expo-sqlite/kv-store", () => {
  const items = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItemSync: (key: string) => items.get(key) ?? null,
      setItem: async (key: string, value: string) => {
        items.set(key, value);
      },
      clearSync: () => items.clear(),
    },
  };
});

const mockUseQuery = jest.mocked(useQuery);
const mockConnectionState = jest.mocked(useConvexConnectionState);

type ConnectionState = ReturnType<typeof useConvexConnectionState>;

const CONNECTION: ConnectionState = {
  hasInflightRequests: false,
  isWebSocketConnected: true,
  timeOfOldestInflightRequest: null,
  hasEverConnected: true,
  connectionCount: 1,
  connectionRetries: 0,
  inflightMutations: 0,
  inflightActions: 0,
};

const ONLINE: ConnectionState = CONNECTION;
/** First launch with no signal: never connected, and has tried and failed. */
const NEVER_CONNECTED: ConnectionState = {
  ...CONNECTION,
  isWebSocketConnected: false,
  hasEverConnected: false,
  connectionCount: 0,
  connectionRetries: 1,
};
/** Still opening the first connection. */
const CONNECTING: ConnectionState = {
  ...CONNECTION,
  isWebSocketConnected: false,
  hasEverConnected: false,
  connectionCount: 0,
};
/** Was connected, then lost signal. */
const DISCONNECTED: ConnectionState = { ...CONNECTION, isWebSocketConnected: false };

const PIKACHU = { id: 25, name: "pikachu" };
const PIKACHU_KEY = 'pokemon:getById:{"id":25}';

function useEevee(): ReturnType<typeof useCachedQuery<typeof api.pokemon.getById>> {
  return useCachedQuery(api.pokemon.getById, { id: 133 });
}

describe("useCachedQuery", () => {
  beforeEach(() => {
    Storage.clearSync();
    mockUseQuery.mockReturnValue(undefined);
    mockConnectionState.mockReturnValue(ONLINE);
  });

  it("reports that it needs a connection when nothing is cached and it's offline", async () => {
    mockConnectionState.mockReturnValue(NEVER_CONNECTED);

    const { result } = await renderHook(useEevee);

    expect(result.current).toEqual({ status: "offline" });
  });

  it("is loading while it connects with nothing cached", async () => {
    mockConnectionState.mockReturnValue(CONNECTING);

    const { result } = await renderHook(useEevee);

    expect(result.current).toEqual({ status: "loading" });
  });

  it("reports that it needs a connection when it lost signal before anything was cached", async () => {
    mockConnectionState.mockReturnValue(DISCONNECTED);

    const { result } = await renderHook(useEevee);

    expect(result.current).toEqual({ status: "offline" });
  });

  it("is loading while skipped", async () => {
    mockConnectionState.mockReturnValue(DISCONNECTED);

    const { result } = await renderHook(() => useCachedQuery(api.pokemon.getById, "skip"));

    expect(result.current).toEqual({ status: "loading" });
  });

  it("returns cached data immediately, before Convex responds", async () => {
    await Storage.setItem(PIKACHU_KEY, JSON.stringify(PIKACHU));
    mockConnectionState.mockReturnValue(CONNECTING);

    const { result } = await renderHook(() => useCachedQuery(api.pokemon.getById, { id: 25 }));

    expect(result.current).toEqual({ status: "loaded", data: PIKACHU });
  });

  it("returns live data when Convex responds, and saves it", async () => {
    const stale = { ...PIKACHU, name: "stale" };
    await Storage.setItem(PIKACHU_KEY, JSON.stringify(stale));
    const { result, rerender } = await renderHook(() =>
      useCachedQuery(api.pokemon.getById, { id: 25 }),
    );
    expect(result.current).toEqual({ status: "loaded", data: stale });

    mockUseQuery.mockReturnValue(PIKACHU);
    await rerender({});

    expect(result.current).toEqual({ status: "loaded", data: PIKACHU });
    expect(JSON.parse(Storage.getItemSync(PIKACHU_KEY) ?? "null")).toEqual(PIKACHU);
  });

  it("keeps returning the data after going offline", async () => {
    mockUseQuery.mockReturnValue(PIKACHU);
    const online = await renderHook(() => useCachedQuery(api.pokemon.getById, { id: 25 }));
    await online.unmount();

    mockUseQuery.mockReturnValue(undefined);
    mockConnectionState.mockReturnValue(DISCONNECTED);
    const { result } = await renderHook(() => useCachedQuery(api.pokemon.getById, { id: 25 }));

    expect(result.current).toEqual({ status: "loaded", data: PIKACHU });
  });

  it("keeps returning the latest data if Convex drops it while offline", async () => {
    await Storage.setItem(PIKACHU_KEY, JSON.stringify({ ...PIKACHU, name: "stale" }));
    mockUseQuery.mockReturnValue(PIKACHU);
    const { result, rerender } = await renderHook(() =>
      useCachedQuery(api.pokemon.getById, { id: 25 }),
    );

    mockUseQuery.mockReturnValue(undefined);
    mockConnectionState.mockReturnValue(DISCONNECTED);
    await rerender({});

    expect(result.current).toEqual({ status: "loaded", data: PIKACHU });
  });
});
