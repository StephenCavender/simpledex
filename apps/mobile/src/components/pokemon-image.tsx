import { Image } from "expo-image";
import { Info } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import { withUniwind } from "uniwind";

import { isScreenshotMode } from "@/lib/screenshot-mode";

const StyledInfo = withUniwind(Info);

interface PokemonImageProps {
  src: string | undefined;
  name: string;
  /** Width and height in points. */
  size: number;
}

/**
 * A Pokémon's artwork, cached on disk, with a placeholder when missing or broken.
 * Screenshot mode obscures it past recognition.
 */
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
  if (isScreenshotMode()) {
    return (
      <View
        role="img"
        aria-label={name}
        testID="pokemon-image-obscured"
        className="items-center justify-center overflow-hidden rounded-full"
        style={{ width: size, height: size }}
      >
        {/* Drawn tiny and scaled up, so even the outline is only a soft blob. */}
        <Image
          source={src}
          cachePolicy="disk"
          contentFit="contain"
          blurRadius={1}
          style={{
            width: SCREENSHOT_DRAW_SIZE,
            height: SCREENSHOT_DRAW_SIZE,
            transform: [{ scale: size / SCREENSHOT_DRAW_SIZE }],
          }}
        />
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

/** The size, in points, screenshot mode draws artwork at before scaling it up to fit. */
const SCREENSHOT_DRAW_SIZE = 8;
