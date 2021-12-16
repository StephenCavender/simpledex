import React from "react"
import { View, ViewStyle, TextStyle, ImageStyle } from "react-native"
import { HeaderProps } from "./header.props"
import { Button } from "../button/button"
import { Text } from "../text/text"
import { Icon } from "../icon/icon"
import { spacing, color } from "../../theme"
import { translate } from "../../i18n/"

// static styles
const ROOT: ViewStyle = {
  paddingTop: spacing[7],
  paddingBottom: spacing[5],
  backgroundColor: color.background,
}
const ROW: ViewStyle = {
  flexDirection: "row",
  paddingHorizontal: spacing[4],
  alignItems: "center",
  justifyContent: "flex-start",
}
const SELECTOR: ViewStyle = {
  marginTop: spacing[2]
}
const TITLE: TextStyle = { textAlign: "center" }
const TITLE_MIDDLE: ViewStyle = { flex: 1, justifyContent: "center" }
const RIGHT: ViewStyle = { width: 32 }
const ICON: ImageStyle = { tintColor: color.text }
const SELECTOR_ICON: ImageStyle = { width: 20 }

export function Header() {

  return (
    <View style={ROOT}>
      <View style={ROW}>
        <Button preset="link" onPress={null}>
          <Icon icon="menu" style={ICON} />
        </Button>
        <View style={TITLE_MIDDLE}>
          <Text style={TITLE} text="SimpleDex" />
        </View>
        <View style={RIGHT} />
      </View>
      <View style={[ROW, SELECTOR]}>
        <Button preset="link" onPress={null}>
          <Icon icon="search" style={[ICON, SELECTOR_ICON]} />
        </Button>
        <Button preset="link" onPress={null}>
          <Icon icon="chevronLeft" style={[ICON, SELECTOR_ICON]} />
        </Button>
        <View style={TITLE_MIDDLE}>
          <Text style={TITLE} text="poke" />
        </View>
        <Button preset="link" onPress={null}>
          <Icon icon="chevronRight" style={[ICON, SELECTOR_ICON]} />
        </Button>
        <Button preset="link" onPress={null}>
          <Icon icon="shuffle" style={[ICON, SELECTOR_ICON]} />
        </Button>
      </View>
    </View>
  )
}
