import { formatPokedexNumber, type PokedexEntry } from "@simpledex/pokedex";
import { FlashList } from "@shopify/flash-list";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { PokemonImage } from "@/components/pokemon-image";
import { TypeBadge } from "@/components/type-badge";

const ARTWORK_SIZE = 64;

/**
 * The whole Pokédex in one unpaginated list. FlashList recycles rows, so
 * scrolling stays smooth with every Pokédex entry loaded.
 */
export function PokedexList({
  entries,
  empty,
}: {
  entries: PokedexEntry[];
  /** Shown when there are no entries. */
  empty: React.ReactElement;
}): React.JSX.Element {
  return (
    <FlashList
      data={entries}
      keyExtractor={(entry) => String(entry.id)}
      renderItem={({ item }) => <PokedexRow entry={item} />}
      ListEmptyComponent={empty}
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode="on-drag"
    />
  );
}

/** A Pokédex entry; tapping it pushes the Pokémon's detail screen. */
function PokedexRow({ entry }: { entry: PokedexEntry }): React.JSX.Element {
  return (
    <Link href={{ pathname: "/pokemon/[id]", params: { id: String(entry.id) } }} asChild>
      <Pressable
        accessibilityRole="link"
        className="flex-row items-center gap-4 border-b border-border px-4 py-2 active:bg-accent"
      >
        <PokemonImage src={entry.image} name={entry.name} size={ARTWORK_SIZE} />
        <View className="flex-1 gap-1">
          <Text className="text-xs text-muted-foreground">{formatPokedexNumber(entry.id)}</Text>
          <Text className="text-base font-medium capitalize text-foreground">{entry.name}</Text>
          <View className="flex-row gap-1">
            {entry.types.map((type) => (
              <TypeBadge key={type} type={type} />
            ))}
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
