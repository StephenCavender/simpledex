import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, Pressable, ViewStyle } from "react-native"
import { Screen, Text, TextField } from "../../components"
// import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../models"
import { color } from "../../theme"
import { debounce } from "lodash"
import { Species } from "../../models/species/species"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
}

export const EvolutionsScreen = observer(function EvolutionsScreen() {
  // Pull in one of our MST stores
  const { speciesStore } = useStores()
  const { species } = speciesStore

  const [filteredSpecies, setFilteredSpecies] = useState([])

  useEffect(() => {
    async function fetchData() {
      await speciesStore.get()
    }

    fetchData()
  }, [])

  const onChangeText = debounce((filter: string) => {
    setFilteredSpecies(species.filter((species: Species) =>
      species.name.toLowerCase().includes(filter.toLowerCase())
    )
  )}, 500)

  const renderItem = ({item}) => (
    <Pressable onPress={() => alert(`clicked on ${item.name}`)}>
      <Text>{item.name}</Text>
    </Pressable>
  )

  // Pull in navigation via hook
  // const navigation = useNavigation()
  return (
    <Screen style={ROOT} preset="fixed">
      <TextField
        placeholder="Pika"
        onChangeText={onChangeText}
        autoCapitalize="none" />
      <FlatList
        data={[...filteredSpecies]}
        renderItem={renderItem} />
    </Screen>
  )
})
