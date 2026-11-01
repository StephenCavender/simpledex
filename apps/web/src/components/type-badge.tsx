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
} from "lucide-react";
import { isPokemonType, type PokemonType } from "@simpledex/pokedex";

/** Each Type's icon. */
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
 * @simpledex/tokens. Spelled out in full so Tailwind can see the class names.
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

const SIZES = {
  sm: { badge: "px-2 py-0.5 text-[10px]", icon: "mr-1 h-3 w-3" },
  md: { badge: "px-3 py-1 text-sm", icon: "mr-1 h-4 w-4" },
};

export function TypeBadge({
  type,
  size = "sm",
}: {
  type: string;
  size?: keyof typeof SIZES;
}): React.ReactElement {
  const known = isPokemonType(type);
  const Icon = known ? TYPE_ICONS[type] : Info;
  const colour = known ? TYPE_COLOURS[type] : "bg-muted-foreground";
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium text-white ${colour} ${SIZES[size].badge}`}
    >
      <Icon className={SIZES[size].icon} aria-hidden />
      {type}
    </span>
  );
}
