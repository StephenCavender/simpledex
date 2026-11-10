import { formatPokedexNumber, type PokedexEntry } from "@simpledex/pokedex";
import { FlashList, type FlashListRef } from "@shopify/flash-list";
import { Pressable, Text, View } from "react-native";

import { PokemonImage } from "@/components/pokemon-image";
import { PokemonLink } from "@/components/pokemon-link";
import { TypeBadge } from "@/components/type-badge";

const ARTWORK_SIZE = 64;

/**
 * The whole Pokédex in one unpaginated list. FlashList recycles rows, so
 * scrolling stays smooth with every Pokédex entry loaded.
 *
 * It doesn't hold its place when `entries` changes: the entries are search
 * and filter results, and FlashList's default of keeping the first visible
 * entry in view would leave the list mid-way down after a search is cleared.
 */
export function PokedexList({
  ref,
  entries,
  empty,
}: {
  ref?: React.Ref<FlashListRef<PokedexEntry>>;
  entries: PokedexEntry[];
  /** Shown when there are no entries. */
  empty: React.ReactElement;
}): React.JSX.Element {
  return (
    <FlashList
      ref={ref}
      data={entries}
      keyExtractor={(entry) => String(entry.id)}
      renderItem={({ item }) => <PokedexRow entry={item} />}
      ListEmptyComponent={empty}
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode="on-drag"
      maintainVisibleContentPosition={{ disabled: true }}
    />
  );
}

/** A Pokédex entry; tapping it pushes the Pokémon's detail screen. */
function PokedexRow({ entry }: { entry: PokedexEntry }): React.JSX.Element {
  return (
    <PokemonLink pokedexNumber={entry.id}>
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
    </PokemonLink>
  );
}
