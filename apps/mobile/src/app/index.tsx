import { api } from "@simpledex/backend/convex/_generated/api";
import { filterPokedex, type PokedexEntry } from "@simpledex/pokedex";
import type { FlashListRef } from "@shopify/flash-list";
import { Link, Stack } from "expo-router";
import { Info, SlidersHorizontal } from "lucide-react-native";
import { useRef, useState } from "react";
import { Platform, Pressable, Text, View, type ColorValue } from "react-native";
import type { SearchBarCommands, SearchBarProps } from "react-native-screens";
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
  const list = useRef<FlashListRef<PokedexEntry>>(null);
  const searchColors = useSearchBarColors();
  const activeFilters = Object.values(filters).filter((value) => value !== undefined).length;
  const entries =
    pokedex.status === "loaded" ? filterPokedex(pokedex.data, { ...filters, q }) : undefined;

  // New results start from the top, not wherever the previous ones were scrolled to.
  const scrollToTop = (): void => list.current?.scrollToOffset({ offset: 0, animated: false });

  const search = (text: string): void => {
    scrollToTop();
    setQ(text);
  };

  const filter = (next: TypeAndGenerationFilters): void => {
    scrollToTop();
    setFilters(next);
  };

  const clearAll = (): void => {
    scrollToTop();
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
        {...searchColors}
        onChangeText={(event) => search(event.nativeEvent.text)}
      />
      <View className="flex-1 bg-background">
        {entries ? (
          <PokedexList
            ref={list}
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
        onChange={filter}
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

/**
 * Search bar colours for the active theme. Android's search view doesn't
 * follow an in-app theme change by itself: its text, hint, and icons keep the
 * device theme's colours unless they're set. The hint's magnifier and the
 * field's underline can't be coloured, so on Android they're removed.
 */
function useSearchBarColors(): Pick<
  SearchBarProps,
  "textColor" | "hintTextColor" | "headerIconColor" | "tintColor" | "shouldShowHintSearchIcon"
> {
  const [foreground, mutedForeground] = useCSSVariable([
    "--color-foreground",
    "--color-muted-foreground",
  ]);
  return {
    textColor: cssColor(foreground, undefined),
    hintTextColor: cssColor(mutedForeground, undefined),
    headerIconColor: cssColor(foreground, undefined),
    // On Android this is the field's background, which replaces the underline; on iOS it's the caret.
    tintColor: Platform.OS === "android" ? "transparent" : undefined,
    shouldShowHintSearchIcon: false,
  };
}

/** Header icons use the foreground colour of the active theme. */
function useHeaderIconColor(): ColorValue | undefined {
  return cssColor(useCSSVariable("--color-foreground"), undefined);
}

function Message({ children }: { children: string }): React.JSX.Element {
  return <Text className="text-center text-base text-muted-foreground">{children}</Text>;
}
