import { api } from "@simpledex/backend/convex/_generated/api";
import { formatPokedexNumber, formatSlug } from "@simpledex/pokedex";
import { useQuery } from "convex/react";
import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { Evolutions } from "@/components/evolutions";
import { PokemonImage } from "@/components/pokemon-image";
import { TypeBadge } from "@/components/type-badge";

const ARTWORK_SIZE = 240;
const POKEDEX_NUMBER = /^\d+$/;
/** The highest any base stat can be. */
const MAX_BASE_STAT = 255;

/** A Pokémon's detail screen, routed by Pokédex number. */
export default function PokemonScreen(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pokedexNumber = POKEDEX_NUMBER.test(id) ? Number(id) : undefined;
  const args = pokedexNumber === undefined ? "skip" : { id: pokedexNumber };

  // Each is undefined while loading; null when there's nothing synced.
  const pokemon = useQuery(api.pokemon.getById, args);
  const species = useQuery(api.pokemon.getSpecies, args);
  const evolutions = useQuery(
    api.pokemon.getEvolutions,
    pokedexNumber === undefined ? "skip" : { pokemon: pokedexNumber },
  );

  if (pokedexNumber === undefined || pokemon === null) {
    return <Message title="Not found">Pokémon not found</Message>;
  }
  if (pokemon === undefined) {
    return <Message title={formatPokedexNumber(pokedexNumber)}>Loading…</Message>;
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
        <Fact label="Habitat">{species?.habitat ?? "Unknown"}</Fact>
        <Fact label="Color">{species?.color ?? "Unknown"}</Fact>
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

      {evolutions !== null && (
        <Section title="Evolutions">
          {evolutions ? (
            <Evolutions stages={evolutions} pokedexNumber={pokemon.id} />
          ) : (
            <Text className="text-sm text-muted-foreground">Loading evolutions…</Text>
          )}
        </Section>
      )}
    </ScrollView>
  );
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

/** A base stat as a bar; the scale matches the web's (full at 100). */
function Stat({ name, value }: { name: string; value: number }): React.JSX.Element {
  return (
    <View className="flex-row items-center gap-2">
      <Text className="w-28 text-xs capitalize text-muted-foreground">{name}</Text>
      <View
        role="progressbar"
        accessibilityLabel={name}
        accessibilityValue={{ min: 0, max: MAX_BASE_STAT, now: value }}
        className="flex-1 rounded-full bg-muted p-0.5"
      >
        <View
          className="h-2 rounded-full bg-primary"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </View>
      <Text className="w-8 text-xs font-medium text-foreground">{value}</Text>
    </View>
  );
}
