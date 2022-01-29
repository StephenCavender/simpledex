import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, FlatList, TextStyle } from "react-native"
import { Screen, Text, Button, ModalDismissIndicator, TextField } from "../../components"
import { useStores, Version } from "../../models"
import { color, spacing } from "../../theme"
import { capitalize, debounce } from "lodash"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
  alignItems: "center",
}
const TEXT: ViewStyle = {
  marginBottom: spacing.medium,
}
const LIST_ITEM_TEXT: TextStyle = {
  fontSize: 18,
}
const LIST_ITEM_BUTTON: ViewStyle = {
  flexDirection: "row",
}

export const FilterScreen = observer(function FilterScreen() {
  const { versionStore, encounterStore } = useStores()
  const { versions } = versionStore
  const { filter } = encounterStore

  const [filteredVersions, setFilteredVersions] = useState([])

  const onChangeText = debounce((filter: string) => {
    if (filter) {
      setFilteredVersions(
        versions.filter((version: Version) =>
          version.name.toLowerCase().includes(filter.toLowerCase()),
        ),
      )
    } else {
      setFilteredVersions([])
    }
  }, 500)

  const renderItem = ({ item }) => (
    <Button
      style={LIST_ITEM_BUTTON}
      textStyle={LIST_ITEM_TEXT}
      preset="link"
      text={capitalize(item.name)}
      onPress={() => encounterStore.setFilter(item.name)}
    />
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
      <TextField
        placeholderTx="filterScreen.searchField.placeholder"
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCompleteType="off"
        autoCorrect={false}
        autoFocus
      />
      <FlatList
        data={filteredVersions}
        renderItem={renderItem}
        keyExtractor={(item, index) => String(index)}
        keyboardShouldPersistTaps="handled"
      />
    </Screen>
  )
})
