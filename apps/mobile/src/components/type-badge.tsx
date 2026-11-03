import { isPokemonType, type PokemonType } from "@simpledex/pokedex";
import {
  Anvil,
  Biohazard,
  Bird,
  Brain,
  Bug,
  Circle,
  Crown,
  Droplets,
  Flame,
  Ghost,
  Info,
  Leaf,
  type LucideIcon,
  Moon,
  Mountain,
  Shovel,
  Snowflake,
  Sparkles,
  Swords,
  Zap,
} from "lucide-react-native";
import { Text, View } from "react-native";

/** Each Type's icon; the same icons as the web's Type badges (ADR-0004). */
const TYPE_ICONS: Record<PokemonType, LucideIcon> = {
  normal: Circle,
  fighting: Swords,
  flying: Bird,
  poison: Biohazard,
  ground: Shovel,
  rock: Mountain,
  bug: Bug,
  ghost: Ghost,
  steel: Anvil,
  fire: Flame,
  water: Droplets,
  grass: Leaf,
  electric: Zap,
  psychic: Brain,
  ice: Snowflake,
  dragon: Crown,
  dark: Moon,
  fairy: Sparkles,
};

/**
 * Each Type's colour, from the `--color-type-<name>` tokens in
 * @simpledex/tokens. Spelled out in full so Uniwind can see the class names.
 */
const TYPE_COLOURS: Record<PokemonType, string> = {
  normal: "bg-type-normal",
  fighting: "bg-type-fighting",
  flying: "bg-type-flying",
  poison: "bg-type-poison",
  ground: "bg-type-ground",
  rock: "bg-type-rock",
  bug: "bg-type-bug",
  ghost: "bg-type-ghost",
  steel: "bg-type-steel",
  fire: "bg-type-fire",
  water: "bg-type-water",
  grass: "bg-type-grass",
  electric: "bg-type-electric",
  psychic: "bg-type-psychic",
  ice: "bg-type-ice",
  dragon: "bg-type-dragon",
  dark: "bg-type-dark",
  fairy: "bg-type-fairy",
};

/** A Type as a solid pill: its token colour, icon, and name in white. */
export function TypeBadge({ type }: { type: string }): React.JSX.Element {
  const known = isPokemonType(type);
  const Icon = known ? TYPE_ICONS[type] : Info;
  const colour = known ? TYPE_COLOURS[type] : "bg-muted-foreground";
  return (
    <View
      testID={`type-badge-${type}`}
      className={`flex-row items-center gap-1 rounded-full px-2 py-0.5 ${colour}`}
    >
      <Icon testID={`type-icon-${known ? type : "unknown"}`} size={12} color="white" />
      <Text className="text-xs font-medium capitalize text-white">{type}</Text>
    </View>
  );
}
