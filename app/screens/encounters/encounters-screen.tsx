import React, { useEffect } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, FlatList } from "react-native"
import { Screen, Text, Card } from "../../components"
import { useStores } from "../../models"
import { color } from "../../theme"
import { capitalize } from "lodash"
import { translate } from "../../i18n"

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

  const renderItem = ({ item, index }) => {
    const i18nTitle = translate("encountersScreen.location", { location: item.location_area })
  
    return (
      <Card title={i18nTitle}>
        {/* // todo: loop through versions: list out version, details (chance, method) */}
        <Text
          txOptions={{ versions: item.version_details.map(v => v.version).join(', ') }}
          tx="encountersScreen.versions" />
        {/* Details: chance, method */}
      </Card>
    )}

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
