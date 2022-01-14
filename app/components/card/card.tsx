import * as React from "react"
import { TextStyle, View, ViewStyle, Dimensions } from "react-native"
import { observer } from "mobx-react-lite"
import { color, spacing } from "../../theme"
import { Text } from "../text/text"

const CARD: ViewStyle = {
  width: Dimensions.get('window').width - 50,
  borderWidth: 2,
  borderColor: color.primary,
  borderRadius: 5,
  paddingBottom: spacing.smaller
}
const CARD_HEADER: ViewStyle = {
  backgroundColor: color.primary,
  paddingVertical: spacing.smaller
}
const CARD_CONTENTS: ViewStyle = {
  padding: spacing.small
}
const TEXT: TextStyle = {
  textAlign: "center",
}

export interface CardProps {
  title: string
  children: React.ReactNode
}

export const Card = observer(function Card(props: CardProps) {
  const { title, children } = props

  return (
    <View style={CARD}>
      <View style={CARD_HEADER}>
        <Text
          preset="bold"
          style={TEXT}
          text={title} />
      </View>
      <View style={CARD_CONTENTS}>
        {children}
      </View>
    </View>
  )
})
