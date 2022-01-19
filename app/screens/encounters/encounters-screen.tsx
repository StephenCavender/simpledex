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
import { VersionDetails } from "./version-details.component"

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

    const cachedFilter = filter
    encounterStore.setFilter(undefined)
    setLoading(true)
    async function fetchData() {
      await encounterStore.get(selected.name)
      setLoading(false)
      encounterStore.setFilter(cachedFilter)
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

  const renderItem = ({ item }) => {
    const i18nTitle = translate("encountersScreen.location", { location: item.location_area })
  
    return (
      <Card title={i18nTitle}>
        <VersionDetails versionDetails={item.version_details} />
      </Card>
    )}

  return (
    <Screen style={ROOT} preset="fixed" unsafe={true}>
      <Text style={HEADER_CONTAINER} preset="header" tx="encountersScreen.title" />
      {loading ? <ActivityIndicator size="large" color={color.secondary} /> : 
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
                    containerCustomStyle={{ flexGrow: 0 }}
                    itemWidth={width - spacing.huge} /> :
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
