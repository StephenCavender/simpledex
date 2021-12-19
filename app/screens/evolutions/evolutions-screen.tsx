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

export const EvolutionsScreen = observer(function EvolutionsScreen() {
  const { speciesStore } = useStores()
  const { selectedSpecies } = speciesStore

  useEffect(() => {
    async function fetchData() {
      // TODO: get evolution data
    }

    fetchData()
  }, [selectedSpecies])

  return (
    <Screen style={ROOT} preset="fixed">
    <Text preset="header" tx="evolutionsScreen.title" />
    </Screen>
  )
})
