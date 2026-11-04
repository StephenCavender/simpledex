import { api } from "@simpledex/backend/convex/_generated/api";
import { filterPokedex } from "@simpledex/pokedex";
import { useQuery } from "convex/react";
import { Stack } from "expo-router";
import { SlidersHorizontal } from "lucide-react-native";
import { useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { SearchBarCommands } from "react-native-screens";
import { useCSSVariable } from "uniwind";

import { ClearAllButton } from "@/components/clear-all-button";
import { FilterSheet, type TypeAndGenerationFilters } from "@/components/filter-sheet";
import { PokedexList } from "@/components/pokedex-list";
import { cssColor } from "@/lib/css-color";

export default function PokedexScreen(): React.JSX.Element {
  const pokedex = useQuery(api.pokemon.pokedex);
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<TypeAndGenerationFilters>({});
  const [sheetOpen, setSheetOpen] = useState(false);
  const searchBar = useRef<SearchBarCommands>(null);
  const activeFilters = Object.values(filters).filter((value) => value !== undefined).length;
  const entries = pokedex ? filterPokedex(pokedex, { ...filters, q }) : undefined;

  const clearAll = (): void => {
    searchBar.current?.clearText();
    setQ("");
    setFilters({});
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <FiltersButton active={activeFilters} onPress={() => setSheetOpen(true)} />
          ),
        }}
      />
      <Stack.SearchBar
        ref={searchBar}
        placeholder="Search by name or number"
        autoCapitalize="none"
        onChangeText={(event) => setQ(event.nativeEvent.text)}
      />
      <View className="flex-1 bg-background">
        {entries ? (
          <PokedexList
            entries={entries}
            empty={
              <View className="items-center gap-4 py-12">
                <Message>No Pokémon found</Message>
                <ClearAllButton onPress={clearAll} />
              </View>
            }
          />
        ) : (
          <View className="py-12">
            <Message>Loading…</Message>
          </View>
        )}
      </View>
      <FilterSheet
        visible={sheetOpen}
        filters={filters}
        onChange={setFilters}
        onClear={clearAll}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}

/** Opens the filter sheet; a dot shows when any filter is active. */
function FiltersButton({
  active,
  onPress,
}: {
  /** How many filters are active. */
  active: number;
  onPress: () => void;
}): React.JSX.Element {
  const foreground = useCSSVariable("--color-foreground");
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Filters"
      accessibilityValue={active > 0 ? { text: `${active} active` } : undefined}
      hitSlop={8}
      onPress={onPress}
    >
      <SlidersHorizontal size={22} color={cssColor(foreground, undefined)} />
      {active > 0 && (
        <View className="absolute -right-1 -top-1 size-2.5 rounded-full border border-background bg-primary" />
      )}
    </Pressable>
  );
}

function Message({ children }: { children: string }): React.JSX.Element {
  return <Text className="text-center text-base text-muted-foreground">{children}</Text>;
}
