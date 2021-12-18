import React, { useEffect } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { Screen, Text } from "../../components"
// import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../models"
import { color } from "../../theme"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
}

export const EvolutionsScreen = observer(function EvolutionsScreen() {
  // Pull in one of our MST stores
  const { speciesStore } = useStores()
  const { selectedSpecies } = speciesStore

  useEffect(() => {
    async function fetchData() {
      await speciesStore.get()
    }

    fetchData()
  }, [])

  // Pull in navigation via hook
  // const navigation = useNavigation()
  return (
    <Screen style={ROOT} preset="fixed">
      <Text>hello</Text>
    </Screen>
  )
})
