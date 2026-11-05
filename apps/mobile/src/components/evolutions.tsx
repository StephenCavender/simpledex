import { evolutionLinks, type EvolutionLink, type EvolutionStage } from "@simpledex/pokedex";
import { Pressable, Text, View } from "react-native";

import { PokemonImage } from "@/components/pokemon-image";
import { PokemonLink } from "@/components/pokemon-link";

const SPRITE_SIZE = 48;

/**
 * The detail screen's Evolutions section: what this Pokémon evolves from and
 * into (with methods), then its whole Evolution Chain. Every other stage opens
 * that Pokémon.
 */
export function Evolutions({
  stages,
  pokedexNumber,
}: {
  stages: EvolutionStage[];
  pokedexNumber: number;
}): React.JSX.Element {
  if (stages.length <= 1) {
    return <Text className="text-sm text-muted-foreground">Does not evolve.</Text>;
  }
  const { from, into, chain } = evolutionLinks(stages, pokedexNumber);
  return (
    <View className="gap-5">
      <Group label="Evolves from">
        {from ? (
          <LinkRow link={from} />
        ) : (
          <Text className="text-sm text-muted-foreground">Nothing: this is the first stage.</Text>
        )}
      </Group>
      <Group label="Evolves into">
        {into.length > 0 ? (
          into.map((link) => <LinkRow key={link.stage.id} link={link} />)
        ) : (
          <Text className="text-sm text-muted-foreground">Nothing: this is a final stage.</Text>
        )}
      </Group>
      <Group label="Evolution chain">
        <View className="flex-row flex-wrap gap-3">
          {chain.map((stage) => (
            <ChainStage key={stage.id} stage={stage} current={stage.id === pokedexNumber} />
          ))}
        </View>
      </Group>
    </View>
  );
}

/** A labelled part of the section, e.g. "Evolves into". */
function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <View accessibilityLabel={label} className="gap-2">
      <Text className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Text>
      {children}
    </View>
  );
}

function LinkRow({ link }: { link: EvolutionLink }): React.JSX.Element {
  return (
    <PokemonLink pokedexNumber={link.stage.id}>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={link.stage.name}
        className="flex-row items-center gap-3 rounded-md active:bg-accent"
      >
        <PokemonImage src={link.stage.sprite} name={link.stage.name} size={SPRITE_SIZE} />
        <Text className="text-sm font-medium capitalize text-foreground">{link.stage.name}</Text>
        {link.method && <Text className="text-xs text-muted-foreground">{link.method}</Text>}
      </Pressable>
    </PokemonLink>
  );
}

/** One stage of the whole chain; the current Pokémon is ringed and doesn't open itself again. */
function ChainStage({
  stage,
  current,
}: {
  stage: EvolutionStage;
  current: boolean;
}): React.JSX.Element {
  return (
    <PokemonLink pokedexNumber={stage.id}>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={stage.name}
        accessibilityState={{ selected: current, disabled: current }}
        disabled={current}
        className={`w-16 items-center ${current ? "" : "opacity-70 active:opacity-100"}`}
      >
        <View className={`rounded-full ${current ? "border-2 border-primary" : ""}`}>
          <PokemonImage src={stage.sprite} name={stage.name} size={SPRITE_SIZE} />
        </View>
        <Text
          numberOfLines={1}
          className={`text-xs capitalize text-foreground ${current ? "font-semibold" : ""}`}
        >
          {stage.name}
        </Text>
      </Pressable>
    </PokemonLink>
  );
}
