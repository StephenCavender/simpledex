import React from "react"
import { View, ViewStyle, TextStyle, ImageStyle } from "react-native"
import { Button } from "../button/button"
import { Text } from "../text/text"
import { Icon } from "../icon/icon"
import { spacing, color } from "../../theme"
import { observer } from "mobx-react-lite"
import { useStores } from "../../models"

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
const SELECTOR_ROW: ViewStyle = {
  marginTop: spacing[2]
}
const TITLE: TextStyle = { textAlign: "center" }
const TITLE_MIDDLE: ViewStyle = { flex: 1, justifyContent: "center" }
const OUTSIDE: ViewStyle = { width: 32 }
const ICON: ImageStyle = { tintColor: color.text }
const SELECTOR_ICON: ImageStyle = { width: 20 }
const SELECTOR: ViewStyle = { flex: 1, alignItems: "center" }

export const Header = observer(function Header() {
  const { speciesStore } = useStores()
  const { selectedSpecies } = speciesStore

  const toggleSearch = () => {
    alert("toggle teh search")
  }

  const previous = () => {
    alert("previous")
  }

  const next = () => {
    alert("next")
  }

  const shuffle = () => {
    alert("shuffle")
  }

  return (
    <View style={ROOT}>
      <View style={ROW}>
        <View style={OUTSIDE} />
        <View style={TITLE_MIDDLE}>
          <Text style={TITLE} text="SimpleDex" />
        </View>
        <View style={OUTSIDE} />
      </View>
      <View style={[ROW, SELECTOR_ROW]}>
        <Button preset="link" onPress={toggleSearch} style={SELECTOR}>
          <Icon icon="search" style={[ICON, SELECTOR_ICON]} />
        </Button>
        <Button preset="link" onPress={previous} style={SELECTOR}>
          <Icon icon="chevronLeft" style={[ICON, SELECTOR_ICON]} />
        </Button>
        <View style={TITLE_MIDDLE}>
          <Text style={TITLE} text={selectedSpecies} />
        </View>
        <Button preset="link" onPress={next} style={SELECTOR}>
          <Icon icon="chevronRight" style={[ICON, SELECTOR_ICON]} />
        </Button>
        <Button preset="link" onPress={shuffle} style={SELECTOR}>
          <Icon icon="shuffle" style={[ICON, SELECTOR_ICON]} />
        </Button>
      </View>
    </View>
  )
})
