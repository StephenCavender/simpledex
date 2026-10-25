/**
 * Fixture adapter for the PokeAPI seam: a `fetch` replacement that answers
 * PokeAPI URLs from responses recorded by `bun run record-fixtures`, and
 * 404s for anything not recorded.
 */

const POKEAPI = "https://pokeapi.co/api/v2/";

const fixtures: Record<string, unknown> = Object.fromEntries(
  Object.entries(
    import.meta.glob<unknown>("./fixtures/pokeapi/**/*.json", { eager: true, import: "default" }),
  ).map(([file, json]) => [
    file
      .replace("./fixtures/pokeapi/", "")
      .replace(/\.json$/, "")
      .replace("__", "?"),
    json,
  ]),
);

export interface FixtureFetch {
  fetch: typeof fetch;
  /** PokeAPI paths requested so far, e.g. `pokemon/25`. */
  requests: string[];
}

export function fixtureFetch(): FixtureFetch {
  const requests: string[] = [];
  const fetchFixture = async (input: RequestInfo | URL): Promise<Response> => {
    const url = String(input instanceof Request ? input.url : input);
    if (!url.startsWith(POKEAPI)) throw new Error(`Unexpected request to ${url}`);
    const path = url.slice(POKEAPI.length).replace(/\/$/, "");
    requests.push(path);
    const json = fixtures[path];
    return json === undefined
      ? new Response("Not Found", { status: 404 })
      : new Response(JSON.stringify(json), { headers: { "content-type": "application/json" } });
  };
  return { fetch: fetchFixture as typeof fetch, requests };
}
