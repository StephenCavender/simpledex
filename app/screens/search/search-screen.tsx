import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, ViewStyle, Image, ImageStyle } from "react-native"
import { Screen, Text, TextField, Button } from "../../components"
import { useStores } from "../../models"
import { color } from "../../theme"
import { debounce, capitalize } from "lodash"
import { Species } from "../../models/species/species"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
  alignItems: "center",
}
const SPRITE: ImageStyle = {
  height: 125,
  width: 125,
}

export const SearchScreen = observer(function SearchScreen() {
  const { speciesStore } = useStores()
  const { selected, species } = speciesStore

  const [filteredSpecies, setFilteredSpecies] = useState([])

  const onChangeText = debounce((filter: string) => {
    setFilteredSpecies(
      species.filter((species: Species) =>
        species.name.toLowerCase().includes(filter.toLowerCase()),
      ),
    )
  }, 500)

  const renderItem = ({ item }) => (
    <Button preset="link" onPress={() => speciesStore.select(item.name)}>
      <Text text={capitalize(item.name)} />
    </Button>
  )

  const renderSprite = () => {
    const variety = selected.varieties.find((variety) => variety.is_default)
    return <Image style={SPRITE} source={{ uri: variety.pokemon.sprites.front_default }} />
  }

  return (
    <Screen style={ROOT} preset="fixed">
      {/* // TODO: swipe indicator */}
      <Text preset="header" tx="searchScreen.title" />
      {!selected ? (
        <Text tx="searchScreen.noSelection" />
      ) : (
        <>
          <Text
            txOptions={{ species: capitalize(selected.name) }}
            tx="searchScreen.currentlySelected"
          />
          {renderSprite()}
        </>
      )}
      {/* // TODO: style text field */}
      <TextField
        placeholderTx="searchScreen.searchField.placeholder"
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCompleteType="off"
        autoCorrect={false}
      />
      <FlatList data={[...filteredSpecies]} renderItem={renderItem} keyExtractor={(item, index) => String(index)} />
    </Screen>
  )
})
