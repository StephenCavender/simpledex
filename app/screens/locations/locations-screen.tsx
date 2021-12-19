import React, { useEffect } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { Screen, Text } from "../../components"
import { useStores } from "../../models"
import { color } from "../../theme"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
  alignItems: "center"
}

export const LocationsScreen = observer(function LocationsScreen() {
  const { speciesStore } = useStores()
  const { selected } = speciesStore

  useEffect(() => {
    async function fetchData() {
      // TODO: get location data
    }

    fetchData()
  }, [selected])

  return (
    <Screen style={ROOT} preset="fixed">
      <Text preset="header" tx="locationsScreen.title" />
    </Screen>
  )
})
