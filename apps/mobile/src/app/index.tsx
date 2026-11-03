import { api } from "@simpledex/backend/convex/_generated/api";
import { filterPokedex } from "@simpledex/pokedex";
import { useQuery } from "convex/react";
import { Stack } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { PokedexList } from "@/components/pokedex-list";

export default function PokedexScreen(): React.JSX.Element {
  const pokedex = useQuery(api.pokemon.pokedex);
  const [q, setQ] = useState("");
  const entries = pokedex ? filterPokedex(pokedex, { q }) : undefined;

  return (
    <>
      <Stack.SearchBar
        placeholder="Search by name or number"
        autoCapitalize="none"
        onChangeText={(event) => setQ(event.nativeEvent.text)}
      />
      <View className="flex-1 bg-background">
        {entries ? (
          <PokedexList entries={entries} empty={<Message>No Pokémon found</Message>} />
        ) : (
          <Message>Loading…</Message>
        )}
      </View>
    </>
  );
}

function Message({ children }: { children: string }): React.JSX.Element {
  return <Text className="py-12 text-center text-base text-muted-foreground">{children}</Text>;
}
