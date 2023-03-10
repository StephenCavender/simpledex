import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, ViewStyle } from "react-native"
import { Screen, Text, TextField, Button, Sprite, ModalDismissIndicator } from "../../components"
import { useStores } from "../../models"
import { color } from "../../theme"
import { debounce, capitalize } from "lodash"
import { Species } from "../../models/species/species"
import { navigationRef } from "../../navigators"
import { useNavigation } from "@react-navigation/native"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
  alignItems: "center",
}
const BUTTON: ViewStyle = {
  flexDirection: "row",
}
const TEXT: TextStyle = {
  fontSize: 18,
}

export const SearchScreen = observer(function SearchScreen() {
  const { speciesStore } = useStores()
  const { selected, species } = speciesStore

  const navigation = useNavigation()

  const [filteredSpecies, setFilteredSpecies] = useState(species)

  const onChangeText = debounce((filter: string) => {
    if (filter) {
      setFilteredSpecies(
        species.filter((species: Species) =>
          species.name.toLowerCase().includes(filter.toLowerCase()),
        ),
      )
    } else {
      setFilteredSpecies(species)
    }
  }, 500)

  const setSpecies = (value: string) => {
    speciesStore.select(value)
    navigation.goBack()
  }

  const renderItem = ({ item }) => (
    <Button
      style={BUTTON}
      textStyle={TEXT}
      preset="link"
      text={capitalize(item.name)}
      onPress={() => setSpecies(item.name)}
    />
  )

  const renderSprite = () => {
    const variety = selected.varieties.find((variety) => variety.is_default)
    return <Sprite uri={variety.pokemon.sprites.front_default} />
  }

  return (
    <Screen style={ROOT} preset="fixed" unsafe>
      <ModalDismissIndicator />
      <Text preset="header" tx="searchScreen.title" />
      {!selected ? (
        <>
          <Text tx="searchScreen.noSelection" />
          <Sprite uri="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png" />
        </>
      ) : (
        <>
          <Text
            txOptions={{ species: capitalize(selected.name) }}
            tx="searchScreen.currentlySelected"
          />
          {renderSprite()}
        </>
      )}
      <TextField
        placeholderTx="searchScreen.searchField.placeholder"
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCompleteType="off"
        autoCorrect={false}
        autoFocus
      />
      <FlatList
        data={filteredSpecies}
        renderItem={renderItem}
        keyExtractor={(item, index) => String(index)}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={5}
      />
    </Screen>
  )
})
