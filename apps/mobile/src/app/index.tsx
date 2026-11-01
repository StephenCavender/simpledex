import { api } from "@simpledex/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { Text, View } from "react-native";

export default function PokedexScreen(): React.JSX.Element {
  const pokedex = useQuery(api.pokemon.pokedex);
  return (
    <View className="flex-1 items-center justify-center gap-2 bg-background p-6">
      <Text className="text-4xl font-bold text-foreground">
        {pokedex === undefined ? "…" : pokedex.length}
      </Text>
      <Text className="text-base text-muted-foreground">Pokédex entries</Text>
    </View>
  );
}
