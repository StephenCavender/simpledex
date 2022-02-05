import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, useWindowDimensions, ActivityIndicator, TextStyle } from "react-native"
import { Screen, Text, Card, Button, NoSelection } from "../../components"
import { Encounter, useStores } from "../../models"
import { color, spacing } from "../../theme"
import { capitalize } from "lodash"
import { translate } from "../../i18n"
import { useNavigation } from "@react-navigation/native"
import Carousel from "react-native-snap-carousel"
import { EncounterDetails } from "./encounter-details"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
  alignItems: "center",
}
const HEADER_CONTAINER: ViewStyle = {
  marginBottom: 10,
}
const FILTER_BUTTON: ViewStyle = {
  marginBottom: spacing.medium,
}
const TEXT: TextStyle = {
  fontSize: 16,
  lineHeight: 20,
  textAlign: "center",
  marginHorizontal: spacing.large
}

export const EncountersScreen = observer(function EncountersScreen() {
  const { speciesStore, encounterStore } = useStores()
  const { selected } = speciesStore
  const { encounters, filter } = encounterStore

  const [filteredEncounters, setFilteredEncounters] = useState([])
  const [loading, setLoading] = useState(false)

  const navigation = useNavigation()

  const { width } = useWindowDimensions()

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

    const filtered = []
    encounters.forEach((encounter: Encounter) => {
      const versionDetails = encounter.version_details.find(versionDetail => versionDetail.version.toLowerCase() === filter.toLowerCase())
      if (versionDetails) {
        filtered.push({ location_area: encounter.location_area, encounter_details: versionDetails.encounter_details})
      }
    })

    setFilteredEncounters(filtered)
  }, [filter])

  const renderItem = ({ item }) => {
    const i18nTitle = translate("encountersScreen.location", { location: item.location_area })

    return (
      <Card title={i18nTitle}>
        <EncounterDetails encounterDetails={item.encounter_details} />
      </Card>
    )
  }

  return (
    <Screen style={ROOT} preset="fixed" unsafe>
      <Text style={HEADER_CONTAINER} preset="header" tx="encountersScreen.title" />
      {loading ? (
        <ActivityIndicator size="large" color={color.secondary} />
      ) : (
        <>
          {!selected ? (
            <NoSelection />
          ) : (
            <>
              <Button
                style={FILTER_BUTTON}
                preset="ghost"
                text={filter || translate("encountersScreen.filterPlaceholder")}
                onPress={() => navigation.navigate("filter")}
              />
              {filter ? (
                <>
                  {filteredEncounters.length ? (
                    <Carousel
                      data={filteredEncounters}
                      renderItem={renderItem}
                      sliderWidth={width}
                      itemWidth={width - spacing.huge}
                      initialNumToRender={3}
                      maxToRenderPerBatch={3}
                      removeClippedSubviews
                    />
                  ) : (
                    <Text
                      style={TEXT}
                      txOptions={{ species: capitalize(selected.name), version: filter }}
                      tx="encountersScreen.noEncounters"
                    />
                  )}
                </>
              ) : (
                <Text style={TEXT} tx="encountersScreen.noFilter" />
              )}
            </>
          )}
        </>
      )}
    </Screen>
  )
})
