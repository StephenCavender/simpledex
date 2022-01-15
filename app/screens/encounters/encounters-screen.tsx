import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, useWindowDimensions, ActivityIndicator } from "react-native"
import { Screen, Text, Card, Button } from "../../components"
import { useStores } from "../../models"
import { color, spacing } from "../../theme"
import { capitalize } from "lodash"
import { translate } from "../../i18n"
import { useNavigation } from "@react-navigation/native"
import Carousel from "react-native-snap-carousel"

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
const FILTER_BUTTON: ViewStyle = {
  marginBottom: spacing.medium
}

export const EncountersScreen = observer(function EncountersScreen() {
  const { speciesStore, encounterStore } = useStores()
  const { selected } = speciesStore
  const { encounters, filter } = encounterStore

  const [filteredEncounters, setFilteredEncounters] = useState([])
  const [loading, setLoading] = useState(false)

  const navigation = useNavigation()

  const { width } = useWindowDimensions();


  useEffect(() => {
    if (!selected) return

    setLoading(true)
    async function fetchData() {
      await encounterStore.get(selected.name)
      setLoading(false)
    }

    fetchData()
  }, [selected])

  useEffect(() => {
    if (!filter) return

    setFilteredEncounters(
      encounters.filter((encounter: Encounter) =>
        encounter.version_details.filter(versionDetails => 
          versionDetails.version.toLowerCase().includes(filter.toLowerCase)
        )
      )
    )
  }, [filter])

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
      {loading ? <ActivityIndicator /> : 
      <>
        {!selected ? (
          <Text style={TEXT} tx="encountersScreen.noSelection" />
        ) : (
          <>
            <Button
              style={FILTER_BUTTON}
              preset="ghost"
              text={filter || translate("encountersScreen.filterPlaceholder")}
              onPress={() => navigation.navigate("filter")} />
            {filter ? 
              <>
                {filteredEncounters.length ? 
                  <Carousel
                    data={filteredEncounters}
                    renderItem={renderItem}
                    sliderWidth={width}
                    itemWidth={width - 50} /> :
                  <Text
                    txOptions={{ species: capitalize(selected.name), version: filter }}
                    tx="encountersScreen.noEncounters"
                  />
                }
              </> : <Text tx="encountersScreen.noFilter" />
            }
          </>
        )}
      </>
      }
    </Screen>
  )
})
