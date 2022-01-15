import React from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, FlatList } from "react-native"
import { Screen, Text, Button, ModalDismissIndicator } from "../../components"
import { useStores } from "../../models"
import { color, spacing } from "../../theme"
import { capitalize } from "lodash"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
  alignItems: "center",
}
const TEXT: ViewStyle = {
  marginBottom: spacing.medium
}
const LIST_ITEM: TextStyle = {
  fontSize: 18
}

export const FilterScreen = observer(function FilterScreen() {
  const { versionStore, encounterStore } = useStores()
  const { versions } = versionStore
  const { filter } = encounterStore

  const renderItem = ({ item }) => (
    <Button preset="link" onPress={() => encounterStore.setFilter(item.name)}>
      <Text style={LIST_ITEM} text={capitalize(item.name)} />
    </Button>
  )

  return (
    <Screen style={ROOT} preset="fixed" unsafe>
      <ModalDismissIndicator />
      <Text preset="header" tx="filterScreen.title" />
      {!filter ? (
        <Text style={TEXT} tx="filterScreen.noFilter" />
      ) : (
        <Text
          style={TEXT}
          txOptions={{ filter: capitalize(filter) }}
          tx="filterScreen.currentlySelected"
        />
      )}
      <FlatList
        data={versions}
        renderItem={renderItem}
        keyExtractor={(item, index) => String(index)} />
    </Screen>
  )
})
