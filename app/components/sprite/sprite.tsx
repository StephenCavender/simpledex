import * as React from "react"
import { ImageStyle } from "react-native"
import { AutoImage as Image } from "../auto-image/auto-image"

const SPRITE: ImageStyle = {
  alignSelf: "center",
  height: 125,
  width: 125,
}

export interface SpriteProps {
  uri: string
}

export const Sprite = function Sprite(props: SpriteProps) {
  const { uri } = props

  return <Image style={SPRITE} source={{ uri }} />
}
