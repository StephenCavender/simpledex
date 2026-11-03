import { Image } from "expo-image";
import { Info } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import { withUniwind } from "uniwind";

const StyledInfo = withUniwind(Info);

interface PokemonImageProps {
  src: string | undefined;
  name: string;
  /** Width and height in points. */
  size: number;
}

/** A Pokémon's artwork, cached on disk, with a placeholder when missing or broken. */
export function PokemonImage(props: PokemonImageProps): React.JSX.Element {
  // Keyed by src so a new image (or a recycled list cell) gets a fresh attempt after a failed one.
  return <LoadingImage key={props.src ?? ""} {...props} />;
}

function LoadingImage({ src, name, size }: PokemonImageProps): React.JSX.Element {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <View
        role="img"
        aria-label={name}
        testID="pokemon-image-placeholder"
        className="items-center justify-center"
        style={{ width: size, height: size }}
      >
        <StyledInfo size={size / 3} colorClassName="accent-muted-foreground" />
      </View>
    );
  }
  return (
    <Image
      source={src}
      alt={name}
      recyclingKey={src}
      cachePolicy="disk"
      contentFit="contain"
      transition={100}
      onError={() => setFailed(true)}
      style={{ width: size, height: size }}
    />
  );
}
