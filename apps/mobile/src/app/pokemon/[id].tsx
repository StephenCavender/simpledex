import { api } from "@simpledex/backend/convex/_generated/api";
import { formatPokedexNumber, formatSlug } from "@simpledex/pokedex";
import type { FunctionReturnType } from "convex/server";
import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { Evolutions } from "@/components/evolutions";
import { PokemonImage } from "@/components/pokemon-image";
import { TypeBadge } from "@/components/type-badge";
import { useCachedQuery, type CachedQuery } from "@/lib/use-cached-query";

const ARTWORK_SIZE = 240;
const POKEDEX_NUMBER = /^\d+$/;
/** The base stat that fills its bar; the same scale as the web. */
const STAT_BAR_FULL = 100;

/** A Pokémon's detail screen, routed by Pokédex number. */
export default function PokemonScreen(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pokedexNumber = POKEDEX_NUMBER.test(id) ? Number(id) : undefined;
  const args = pokedexNumber === undefined ? "skip" : { id: pokedexNumber };

  // Each query's data is null when there's nothing synced.
  const pokemonQuery = useCachedQuery(api.pokemon.getById, args);
  const species = useCachedQuery(api.pokemon.getSpecies, args);
  const evolutions = useCachedQuery(
    api.pokemon.getEvolutions,
    pokedexNumber === undefined ? "skip" : { pokemon: pokedexNumber },
  );

  if (pokedexNumber === undefined) {
    return <Message title="Not found">Pokémon not found</Message>;
  }
  if (pokemonQuery.status !== "loaded") {
    return (
      <Message title={formatPokedexNumber(pokedexNumber)}>
        {pokemonQuery.status === "offline"
          ? "SimpleDex needs a connection to load this Pokémon"
          : "Loading…"}
      </Message>
    );
  }
  const pokemon = pokemonQuery.data;
  if (pokemon === null) {
    return <Message title="Not found">Pokémon not found</Message>;
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-6 p-4"
      contentInsetAdjustmentBehavior="automatic"
    >
      <Stack.Screen options={{ title: formatPokedexNumber(pokemon.id) }} />
      <View className="items-center gap-2">
        <Text className="text-sm text-muted-foreground">{formatPokedexNumber(pokemon.id)}</Text>
        <Text accessibilityRole="header" className="text-4xl font-bold capitalize text-foreground">
          {pokemon.name}
        </Text>
        <View className="flex-row gap-2">
          {pokemon.types.map((type) => (
            <TypeBadge key={type} type={type} />
          ))}
        </View>
      </View>

      <View testID="pokemon-artwork" className="items-center">
        <PokemonImage
          src={pokemon.artwork ?? pokemon.sprite}
          name={pokemon.name}
          size={ARTWORK_SIZE}
        />
      </View>

      <View className="flex-row flex-wrap gap-3">
        <Fact label="Height">{`${pokemon.height} m`}</Fact>
        <Fact label="Weight">{`${pokemon.weight} kg`}</Fact>
        <Fact label="Habitat">{speciesFact(species, "habitat")}</Fact>
        <Fact label="Color">{speciesFact(species, "color")}</Fact>
      </View>

      {pokemon.abilities.length > 0 && (
        <Section title="Abilities">
          <View className="flex-row flex-wrap gap-2">
            {pokemon.abilities.map((ability) => (
              <View
                key={ability.name}
                className={`rounded-full px-3 py-1 ${ability.isHidden ? "bg-muted" : "bg-secondary"}`}
              >
                <Text
                  className={`text-sm capitalize text-foreground ${ability.isHidden ? "italic" : ""}`}
                >
                  {`${formatSlug(ability.name)}${ability.isHidden ? " (hidden)" : ""}`}
                </Text>
              </View>
            ))}
          </View>
        </Section>
      )}

      {pokemon.stats.length > 0 && (
        <Section title="Base Stats">
          <View className="gap-2">
            {pokemon.stats.map((stat) => (
              <Stat key={stat.name} name={formatSlug(stat.name)} value={stat.value} />
            ))}
          </View>
        </Section>
      )}

      {!(evolutions.status === "loaded" && evolutions.data === null) && (
        <Section title="Evolutions">
          {evolutions.status === "loaded" && evolutions.data ? (
            <Evolutions stages={evolutions.data} pokedexNumber={pokemon.id} />
          ) : (
            <Text className="text-sm text-muted-foreground">
              {evolutions.status === "offline"
                ? "Evolutions need a connection to load"
                : "Loading evolutions…"}
            </Text>
          )}
        </Section>
      )}
    </ScrollView>
  );
}

/**
 * A species fact: "…" while species is loading or needs a connection, or
 * "Unknown" when it isn't synced.
 */
function speciesFact(
  species: CachedQuery<FunctionReturnType<typeof api.pokemon.getSpecies>>,
  fact: "habitat" | "color",
): string {
  if (species.status !== "loaded") return "…";
  return species.data?.[fact] || "Unknown";
}

function Message({ title, children }: { title: string; children: string }): React.JSX.Element {
  return (
    <View className="flex-1 bg-background py-12">
      <Stack.Screen options={{ title }} />
      <Text className="text-center text-base text-muted-foreground">{children}</Text>
    </View>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <View className="gap-3">
      <Text accessibilityRole="header" className="text-lg font-semibold text-foreground">
        {title}
      </Text>
      {children}
    </View>
  );
}

/** Two to a row, like the web's grid on a phone. */
function Fact({ label, children }: { label: string; children: string }): React.JSX.Element {
  return (
    <View className="min-w-[45%] flex-1 items-center rounded-lg bg-muted p-4">
      <Text className="mb-1 text-xs text-muted-foreground">{label}</Text>
      <Text className="text-lg font-semibold capitalize text-foreground">{children}</Text>
    </View>
  );
}

/** A base stat as a bar, with its value read out rather than a percentage. */
function Stat({ name, value }: { name: string; value: number }): React.JSX.Element {
  return (
    <View className="flex-row items-center gap-2">
      <Text className="w-28 text-xs capitalize text-muted-foreground">{name}</Text>
      <View
        role="progressbar"
        accessibilityLabel={name}
        accessibilityValue={{ text: String(value) }}
        className="flex-1 rounded-full bg-muted p-0.5"
      >
        <View
          className="h-2 rounded-full bg-primary"
          style={{ width: `${(Math.min(value, STAT_BAR_FULL) / STAT_BAR_FULL) * 100}%` }}
        />
      </View>
      <Text className="w-8 text-xs font-medium text-foreground">{value}</Text>
    </View>
  );
}
