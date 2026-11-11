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
    return <BlurredImage src={src} name={name} size={size} />;
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

/**
 * Screenshot mode's artwork: blurred by a fixed share of the image's own width,
 * so official artwork (475px) and small sprites (96px) are blurred alike. It's
 * hidden until it has loaded and its width is known, so it never shows sharp.
 * Chosen from a prototype of three treatments (branch
 * prototype/screenshot-artwork, #15); if a store rejects the screenshots, its
 * Type-coloured circles are the fallback. expo-image halves blurRadius on iOS
 * and caps it at 25 on Android, where outlines stay sharper.
 */
function BlurredImage({
  src,
  name,
  size,
}: {
  src: string;
  name: string;
  size: number;
}): React.JSX.Element {
  const [sourceWidth, setSourceWidth] = useState<number>();
  return (
    <View
      role="img"
      aria-label={name}
      testID="pokemon-image-obscured"
      className="items-center justify-center overflow-hidden rounded-full"
      style={{ width: size, height: size }}
    >
      <Image
        testID="pokemon-image-blurred"
        source={src}
        cachePolicy="disk"
        contentFit="contain"
        blurRadius={
          sourceWidth === undefined ? undefined : Math.round(sourceWidth * SCREENSHOT_BLUR_SHARE)
        }
        onLoad={(event) => setSourceWidth(event.source.width)}
        style={{ width: size, height: size, opacity: sourceWidth === undefined ? 0 : 1 }}
      />
    </View>
  );
}

/** How much of an image's width screenshot mode blurs it by: 475px artwork gets about 160. */
const SCREENSHOT_BLUR_SHARE = 1 / 3;
