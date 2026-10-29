import { Info } from "lucide-react";
import { useState } from "react";

const SIZES = {
  xs: { box: "h-12 w-12", icon: "h-5 w-5" },
  sm: { box: "h-20 w-20", icon: "h-8 w-8" },
  md: { box: "h-24 w-24", icon: "h-8 w-8" },
  lg: { box: "h-48 w-48", icon: "h-16 w-16" },
};

interface PokemonImageProps {
  src: string | undefined;
  name: string;
  size: keyof typeof SIZES;
  className?: string;
}

/** A Pokémon's artwork or sprite, lazy-loaded, with a placeholder when missing or broken. */
export function PokemonImage(props: PokemonImageProps): React.ReactElement {
  // Keyed by src so a new image gets a fresh attempt after a failed one.
  return <LoadingImage key={props.src ?? ""} {...props} />;
}

function LoadingImage({ src, name, size, className = "" }: PokemonImageProps): React.ReactElement {
  const [failed, setFailed] = useState(false);
  const { box, icon } = SIZES[size];

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={name}
        className={`flex items-center justify-center text-muted-foreground ${box} ${className}`}
      >
        <Info className={icon} aria-hidden />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-contain ${box} ${className}`}
    />
  );
}
