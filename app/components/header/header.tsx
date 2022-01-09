import React, { useEffect, useState } from "react"
import { View, ViewStyle, TextStyle, ImageStyle, Pressable } from "react-native"
import { Button } from "../button/button"
import { Text } from "../text/text"
import { Icon } from "../icon/icon"
import { spacing, color } from "../../theme"
import { observer } from "mobx-react-lite"
import { Species, useStores } from "../../models"
import { useNavigation } from "@react-navigation/native"
import { capitalize, sample } from "lodash"

// static styles
const ROOT: ViewStyle = {
  paddingTop: spacing.huge,
  paddingBottom: spacing.large,
  backgroundColor: color.background,
}
const ROW: ViewStyle = {
  flexDirection: "row",
  paddingHorizontal: spacing.medium,
  alignItems: "center",
  justifyContent: "flex-start",
}
const SELECTOR_ROW: ViewStyle = {
  marginTop: spacing.smaller,
}
const TITLE: TextStyle = { textAlign: "center" }
const BOLD: TextStyle = { fontWeight: "bold" }
const TITLE_MIDDLE: ViewStyle = { flex: 2, justifyContent: "center" }
const OUTSIDE: ViewStyle = { width: 32 }
const ICON: ImageStyle = { tintColor: color.text }
const ICON_DISABLED: ImageStyle = { tintColor: color.dim }
const SELECTOR_ICON: ImageStyle = { width: 20 }
const SELECTOR: ViewStyle = { flex: 1, alignItems: "center" }

export const Header = observer(function Header() {
  const [previousDisabled, setPreviousDisabled] = useState(true)
  const [nextDisabled, setNextDisabled] = useState(true)

  const { speciesStore } = useStores()
  const { species, selected } = speciesStore

  const navigation = useNavigation()

  const toggleSearch = () => {
    navigation.navigate("search")
  }

  useEffect(() => {
    if (selected) {
      if (selected.id > 1) {
        setPreviousDisabled(false)
      }
      if (selected.id < species.length) {
        setNextDisabled(false)
      }
    } else {
      setPreviousDisabled(true)
      setNextDisabled(true)
    }
    return () => {
      setPreviousDisabled(true)
      setNextDisabled(true)
    }
  }, [selected])

  const previous = () => {
    const index = species.findIndex((s) => s.name.toLowerCase() === selected.name.toLowerCase())
    alert(`previous, index: ${index}`)
  }

  const next = () => {
    const index = species.findIndex((s) => s.name.toLowerCase() === selected.name.toLowerCase())
    alert(`next, index: ${index}`)
  }

  const random = () => {
    const { name }: Species = sample(species)
    speciesStore.select(name)
  }

  return (
    <View style={ROOT}>
      <View style={ROW}>
        <View style={OUTSIDE} />
        <View style={TITLE_MIDDLE}>
          <Text style={[TITLE, BOLD]} text="SimpleDex" />
        </View>
        <View style={OUTSIDE} />
      </View>
      <View style={[ROW, SELECTOR_ROW]}>
        <Button preset="link" onPress={toggleSearch} style={SELECTOR}>
          <Icon icon="search" style={[ICON, SELECTOR_ICON]} />
        </Button>
        <Button disabled={previousDisabled} preset="link" onPress={previous} style={SELECTOR}>
          <Icon
            icon="chevronLeft"
            style={[ICON, SELECTOR_ICON, previousDisabled ? ICON_DISABLED : null]}
          />
        </Button>
        <View style={TITLE_MIDDLE}>
          {!!selected && (
            <Pressable onLongPress={toggleSearch}>
              <Text style={TITLE} text={capitalize(selected.name)} />
            </Pressable>
          )}
        </View>
        <Button disabled={nextDisabled} preset="link" onPress={next} style={SELECTOR}>
          <Icon
            icon="chevronRight"
            style={[ICON, SELECTOR_ICON, nextDisabled ? ICON_DISABLED : null]}
          />
        </Button>
        <Button preset="link" onPress={random} style={SELECTOR}>
          <Icon icon="shuffle" style={[ICON, SELECTOR_ICON]} />
        </Button>
      </View>
    </View>
  )
})
