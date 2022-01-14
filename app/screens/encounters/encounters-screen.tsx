import React, { useEffect } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, FlatList, View, Dimensions } from "react-native"
import { Screen, Text } from "../../components"
import { useStores } from "../../models"
import { color, spacing } from "../../theme"
import { capitalize } from "lodash"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
  alignItems: "center",
}
const HEADER_CONTAINER: ViewStyle = {
  marginBottom: 10,
}
const TEXT: TextStyle = {
  textAlign: "center",
}
const CARD: ViewStyle = {
  width: Dimensions.get('window').width - 100,
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

export const EncountersScreen = observer(function EncountersScreen() {
  const { speciesStore, encounterStore } = useStores()
  const { selected } = speciesStore
  const { encounters } = encounterStore

  useEffect(() => {
    if (!selected) return

    async function fetchData() {
      await encounterStore.get(selected.name)
    }

    fetchData()
  }, [selected])

  const renderItem = ({ item, index }) => (
    <View style={CARD}>
      <View style={CARD_HEADER}>
        <Text
          preset="bold"
          style={TEXT}
          txOptions={{ location: item.location_area }}
          tx="encountersScreen.location" />
      </View>
      <View style={CARD_CONTENTS}>
        {/* // todo: loop through versions: list out version, details (chance, method) */}
        <Text
          txOptions={{ versions: item.version_details.map(v => v.version).join(', ') }}
          tx="encountersScreen.versions" />
        {/* Details: chance, method */}
      </View>
    </View>
  )

  return (
    <Screen style={ROOT} preset="fixed" unsafe={true}>
      <Text style={HEADER_CONTAINER} preset="header" tx="encountersScreen.title" />
      {!selected ? (
        <Text style={TEXT} tx="encountersScreen.noSelection" />
      ) : (
        <FlatList
          data={encounters}
          renderItem={renderItem}
          listEmptyComponent={
            <Text
              txOptions={{ species: capitalize(selected.name) }}
              tx="encountersScreen.noEncounters" />
          } />
      )}
    </Screen>
  )
})
