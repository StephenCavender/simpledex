import React, { useEffect } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { Screen, Text } from "../../components"
import { useStores } from "../../models"
import { color } from "../../theme"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
  alignItems: "center",
}

export const EncountersScreen = observer(function EncountersScreen() {
  const { speciesStore } = useStores()
  const { selected } = speciesStore

  useEffect(() => {
    async function fetchData() {
      // TODO: get encounter data
    }

    fetchData()
  }, [selected])

  return (
    <Screen style={ROOT} preset="fixed" unsafe={true}>
      <Text preset="header" tx="encountersScreen.title" />
    </Screen>
  )
})
