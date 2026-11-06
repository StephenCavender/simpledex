import { api } from "@simpledex/backend/convex/_generated/api";
import { filterPokedex } from "@simpledex/pokedex";
import { Link, Stack } from "expo-router";
import { Info, SlidersHorizontal } from "lucide-react-native";
import { useRef, useState } from "react";
import { Pressable, Text, View, type ColorValue } from "react-native";
import type { SearchBarCommands } from "react-native-screens";
import { useCSSVariable } from "uniwind";

import { ClearAllButton } from "@/components/clear-all-button";
import { FilterSheet, type TypeAndGenerationFilters } from "@/components/filter-sheet";
import { PokedexList } from "@/components/pokedex-list";
import { cssColor } from "@/lib/css-color";
import { useCachedQuery } from "@/lib/use-cached-query";

export default function PokedexScreen(): React.JSX.Element {
  const pokedex = useCachedQuery(api.pokemon.pokedex, {});
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<TypeAndGenerationFilters>({});
  const [sheetOpen, setSheetOpen] = useState(false);
  const searchBar = useRef<SearchBarCommands>(null);
  const activeFilters = Object.values(filters).filter((value) => value !== undefined).length;
  const entries =
    pokedex.status === "loaded" ? filterPokedex(pokedex.data, { ...filters, q }) : undefined;

  const clearAll = (): void => {
    searchBar.current?.clearText();
    setQ("");
    setFilters({});
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => <AboutButton />,
          headerRight: () => (
            <FiltersButton active={activeFilters} onPress={() => setSheetOpen(true)} />
          ),
        }}
      />
      <Stack.SearchBar
        ref={searchBar}
        placeholder="Search by name or number"
        autoCapitalize="none"
        // iOS 26 would move search into a bottom toolbar, which UIKit then leaves behind,
        // empty, over pushed detail screens (#20). Keep it in the header on every platform.
        allowToolbarIntegration={false}
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
            <Message>
              {pokedex.status === "offline"
                ? "SimpleDex needs a connection to load the Pokédex"
                : "Loading…"}
            </Message>
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

/** Pushes the About screen. */
function AboutButton(): React.JSX.Element {
  const iconColor = useHeaderIconColor();
  return (
    <Link href="/about" push asChild>
      <Pressable accessibilityLabel="About" hitSlop={8} className="p-1">
        <Info size={22} color={iconColor} />
      </Pressable>
    </Link>
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
  const iconColor = useHeaderIconColor();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Filters"
      accessibilityValue={active > 0 ? { text: `${active} active` } : undefined}
      hitSlop={8}
      onPress={onPress}
      // The native header clips its items, so pad the icon to keep the dot in bounds.
      className="p-1"
    >
      <SlidersHorizontal size={22} color={iconColor} />
      {active > 0 && (
        <View className="absolute right-0 top-0 size-2.5 rounded-full border border-background bg-destructive" />
      )}
    </Pressable>
  );
}

/** Header icons use the foreground colour of the active theme. */
function useHeaderIconColor(): ColorValue | undefined {
  return cssColor(useCSSVariable("--color-foreground"), undefined);
}

function Message({ children }: { children: string }): React.JSX.Element {
  return <Text className="text-center text-base text-muted-foreground">{children}</Text>;
}
