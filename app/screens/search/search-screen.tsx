import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, Pressable, View, ViewStyle } from "react-native"
import { Screen, Text, TextField } from "../../components"
import { useStores } from "../../models"
import { color } from "../../theme"
import { debounce } from "lodash"
import { Species } from "../../models/species/species"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
}
const CENTER: ViewStyle = {
  alignItems: "center"
}

export const SearchScreen = observer(function SearchScreen() {
  const { speciesStore } = useStores()
  const { selectedSpecies, species } = speciesStore

  const [filteredSpecies, setFilteredSpecies] = useState([])

  const select = (species: string) => {
    speciesStore.select(species)
  }

  const onChangeText = debounce((filter: string) => {
    setFilteredSpecies(species.filter((species: Species) =>
      species.name.toLowerCase().includes(filter.toLowerCase())
    )
  )}, 500)

  const renderItem = ({item}) => (
    // TODO: try button
    <Pressable onPress={() => select(item.name)}>
      <Text>{item.name}</Text>
    </Pressable>
  )


  return (
    <Screen style={ROOT} preset="fixed">
      <View style={CENTER}>
        <Text preset="header" tx="searchScreen.title" text="Search" />
        {!selectedSpecies ?
          <Text text="No selection has been made." tx="searchScreen.noSelection" /> :
          <>
            <Text text={selectedSpecies} />
            <Text text=" is currently selected." tx="searchScreen.currentlySelected" />
          </>
        }
        {/* TODO: style text field */}
        <TextField
          placeholder="Pika"
          placeholderTx="searchScreen.searchField.placeholder"
          onChangeText={onChangeText}
          autoCapitalize="none" />
        <FlatList
          data={[...filteredSpecies]}
          renderItem={renderItem} />
      </View>
    </Screen>
  )
})
