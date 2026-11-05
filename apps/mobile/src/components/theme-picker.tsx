import { Pressable, Text, View } from "react-native";

import { useThemePreference, type ThemePreference } from "@/lib/theme-preference";

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

/** Chooses Light, Dark, or System; the choice applies at once and is saved. */
export function ThemePicker(): React.JSX.Element {
  const [preference, setPreference] = useThemePreference();
  return (
    <View accessibilityRole="radiogroup" className="flex-row gap-1 rounded-lg bg-muted p-1">
      {OPTIONS.map(({ value, label }) => {
        const checked = preference === value;
        return (
          <Pressable
            key={value}
            accessibilityRole="radio"
            accessibilityLabel={label}
            accessibilityState={{ checked }}
            onPress={() => setPreference(value)}
            className={`flex-1 items-center rounded-md py-2 ${checked ? "bg-background" : ""}`}
          >
            <Text
              className={`text-sm font-medium ${checked ? "text-foreground" : "text-muted-foreground"}`}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
