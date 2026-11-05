import { Link } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { ThemePicker } from "@/components/theme-picker";

/** What SimpleDex is and where its data comes from, with the theme picker. */
export default function AboutScreen(): React.JSX.Element {
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-6 p-4"
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text accessibilityRole="header" className="text-center text-4xl font-bold text-foreground">
        SimpleDex
      </Text>
      <Card title="About">
        <Text className="text-base text-muted-foreground">
          SimpleDex is a quick reference for Pokémon. Browse and search the whole Pokédex, filter by
          Type and Generation, and see each Pokémon's stats, abilities, and Evolution Chain.
        </Text>
        <Text className="text-base text-muted-foreground">
          Data from{" "}
          <Link href="https://pokeapi.co" className="text-primary">
            PokeAPI
          </Link>
          .
        </Text>
      </Card>
      <Card title="Theme">
        <ThemePicker />
      </Card>
    </ScrollView>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <View className="gap-3 rounded-lg border border-border bg-card p-4">
      <Text accessibilityRole="header" className="text-lg font-semibold text-card-foreground">
        {title}
      </Text>
      {children}
    </View>
  );
}
