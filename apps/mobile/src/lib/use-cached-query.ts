import { useConvexConnectionState, useQuery } from "convex/react";
import {
  getFunctionName,
  type FunctionArgs,
  type FunctionReference,
  type FunctionReturnType,
} from "convex/server";
import Storage from "expo-sqlite/kv-store";
import { useEffect, useState } from "react";

type ConnectionState = ReturnType<typeof useConvexConnectionState>;

/** What a cached query has to show. */
export type CachedQuery<T> =
  /** Waiting for Convex, with nothing cached. */
  | { status: "loading" }
  /** Nothing cached and no connection to fetch it with. */
  | { status: "offline" }
  /** Live data, or the last data saved for this query. */
  | { status: "loaded"; data: T };

/**
 * Convex's `useQuery`, cached in the key-value store so that anything viewed
 * before still loads offline.
 */
export function useCachedQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: FunctionArgs<Query> | "skip",
): CachedQuery<FunctionReturnType<Query>> {
  const live = useQuery(query, args);
  const connection = useConvexConnectionState();
  const key = args === "skip" ? undefined : cacheKey(query, args);
  // The last data known for this key: read from the store once, then kept up
  // to date with live data, so Convex dropping a result while offline loses nothing.
  const [lastKnown, setLastKnown] = useState(() => ({
    key,
    entry: readStored<FunctionReturnType<Query>>(key),
  }));
  let entry = lastKnown.key === key ? lastKnown.entry : readStored<FunctionReturnType<Query>>(key);
  if (live !== undefined && entry?.data !== live) entry = { data: live };
  if (lastKnown.key !== key || lastKnown.entry !== entry) setLastKnown({ key, entry });

  useEffect(() => {
    if (key !== undefined && live !== undefined) void Storage.setItem(key, JSON.stringify(live));
  }, [key, live]);

  if (entry) return { status: "loaded", data: entry.data };
  if (key !== undefined && isOffline(connection)) return { status: "offline" };
  return { status: "loading" };
}

/** The store key for a query and its arguments, e.g. `pokemon:getById:{"id":25}`. */
function cacheKey<Query extends FunctionReference<"query">>(
  query: Query,
  args: FunctionArgs<Query>,
): string {
  return `${getFunctionName(query)}:${JSON.stringify(args)}`;
}

/** What the store holds for a key, wrapped so that a stored `null` isn't "nothing stored". */
function readStored<T>(key: string | undefined): { data: T } | undefined {
  const stored = key === undefined ? null : Storage.getItemSync(key);
  return stored === null ? undefined : { data: JSON.parse(stored) };
}

/**
 * Disconnected after having been connected, or the first connection has
 * failed at least once. Not while the first connection is still opening.
 */
function isOffline(connection: ConnectionState): boolean {
  return (
    !connection.isWebSocketConnected &&
    (connection.hasEverConnected || connection.connectionRetries > 0)
  );
}
