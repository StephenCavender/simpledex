import * as React from "react"
import { ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { color, spacing, typography } from "../../theme"
import { Text } from "../text/text"
import { Button } from "../button/button"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../models"
import { sample } from "lodash"
import { Icon } from ".."

const CONTAINER: ViewStyle = {
  flex: 1,
  justifyContent: "space-around",
  maxHeight: 200,
}
const TEXT: TextStyle = {
  fontFamily: typography.primary,
  fontSize: 16,
  color: color.text,
  textAlign: "center",
}
const ROW: ViewStyle = {
  flexDirection: "row",
}
const ICON: ImageStyle = {
  tintColor: color.text,
  width: 20,
  marginRight: spacing.medium,
}

/**
 * Component shown when evolution or encounter data can't be shown
 */
export const NoSelection = observer(function NoSelection() {
  const { speciesStore } = useStores()
  const { species } = speciesStore

  const navigation = useNavigation()

  const search = () => navigation.navigate("search")

  const shuffle = () => {
    const { name }: Species = sample(species)
    speciesStore.select(name)
  }

  return (
    <View style={CONTAINER}>
      <Text style={TEXT} tx="noSelection.message" />
      <Button onPress={search} style={ROW}>
        <Icon icon="search" style={ICON} />
        <Text tx="noSelection.search" />
      </Button>
      <Text style={TEXT} tx="noSelection.or" />
      <Button onPress={shuffle} style={ROW}>
        <Icon icon="shuffle" style={ICON} />
        <Text tx="noSelection.shuffle" />
      </Button>
    </View>
  )
})
