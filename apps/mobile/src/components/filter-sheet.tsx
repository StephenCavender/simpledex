import { GENERATIONS } from "@simpledex/backend/convex/generations";
import { POKEMON_TYPES, type PokedexFilters } from "@simpledex/pokedex";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ClearAllButton } from "@/components/clear-all-button";
import { TypeBadge } from "@/components/type-badge";

/** The filters other than search, which lives in the header. */
export type TypeAndGenerationFilters = Omit<PokedexFilters, "q">;

/**
 * A bottom sheet with the Type and Generation filters. Each choice applies as
 * soon as it's tapped; tapping the chosen one again clears it.
 */
export function FilterSheet({
  visible,
  filters,
  onChange,
  onClear,
  onClose,
}: {
  visible: boolean;
  filters: TypeAndGenerationFilters;
  onChange: (filters: TypeAndGenerationFilters) => void;
  /** Clears search as well as these filters. */
  onClear: () => void;
  onClose: () => void;
}): React.JSX.Element {
  /** Chooses a value, or clears it if it's already chosen. */
  const toggle = <Key extends keyof TypeAndGenerationFilters>(
    key: Key,
    value: TypeAndGenerationFilters[Key],
  ): void => onChange({ ...filters, [key]: filters[key] === value ? undefined : value });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        className="flex-1 bg-black/40"
        accessibilityLabel="Close filters"
        onPress={onClose}
      />
      <View className="max-h-[75%] rounded-t-2xl bg-card">
        <SafeAreaView edges={["bottom"]}>
          <View className="flex-row items-center justify-between px-4 pt-4">
            <Text className="text-xl font-semibold text-card-foreground">Filters</Text>
            <ClearAllButton onPress={onClear} />
          </View>
          <ScrollView contentContainerClassName="gap-3 p-4">
            <Section title="Type">
              {POKEMON_TYPES.map((type) => (
                <Choice
                  key={type}
                  label={type}
                  checked={filters.type === type}
                  onPress={() => toggle("type", type)}
                >
                  <TypeBadge type={type} />
                </Choice>
              ))}
            </Section>
            <Section title="Generation">
              {GENERATIONS.map((generation) => (
                <Choice
                  key={generation.number}
                  label={`${generation.label} ${generation.region}`}
                  checked={filters.gen === generation.number}
                  onPress={() => toggle("gen", generation.number)}
                >
                  <View className="flex-row gap-1 rounded-full bg-muted px-3 py-1">
                    <Text className="text-sm font-medium text-foreground">{generation.label}</Text>
                    <Text className="text-sm text-muted-foreground">{generation.region}</Text>
                  </View>
                </Choice>
              ))}
            </Section>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
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
    <>
      <Text className="text-lg font-semibold text-card-foreground">{title}</Text>
      <View accessibilityRole="radiogroup" className="flex-row flex-wrap gap-2">
        {children}
      </View>
    </>
  );
}

/** One option in a group; the chosen one is ringed in the foreground colour. */
function Choice({
  label,
  checked,
  onPress,
  children,
}: {
  label: string;
  checked: boolean;
  onPress: () => void;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked }}
      onPress={onPress}
      className={`rounded-full p-0.5 ${checked ? "bg-foreground" : ""}`}
    >
      {children}
    </Pressable>
  );
}
