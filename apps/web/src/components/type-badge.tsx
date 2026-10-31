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

/** Each Type's icon. Its colour is the `--type-<name>` token in index.css. */
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
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium text-white ${SIZES[size].badge}`}
      style={{ backgroundColor: known ? `var(--type-${type})` : "var(--muted-foreground)" }}
    >
      <Icon className={SIZES[size].icon} aria-hidden />
      {type}
    </span>
  );
}
