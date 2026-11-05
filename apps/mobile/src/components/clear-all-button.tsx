import { Pressable, Text } from "react-native";

/** The one action that clears search and every filter, restoring the full Pokédex. */
export function ClearAllButton({ onPress }: { onPress: () => void }): React.JSX.Element {
  return (
    <Pressable accessibilityRole="button" hitSlop={8} onPress={onPress}>
      <Text className="text-base font-medium text-primary">Clear all</Text>
    </Pressable>
  );
}
