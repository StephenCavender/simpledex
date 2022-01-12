import React, { useEffect } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle, TouchableOpacity, FlatList, TextStyle, ImageStyle, useWindowDimensions } from "react-native"
import { Screen, Text, AutoImage as Image } from "../../components"
import { EvolutionDetails, Species, useStores } from "../../models"
import { color, spacing } from "../../theme"
import { capitalize } from "lodash"
import Carousel from "react-native-snap-carousel"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
  alignItems: "center",
}
const TEXT_CONTAINER: ViewStyle = {
  marginBottom: 10,
}
const TEXT: TextStyle = {
  textAlign: "center",
}
const CARD: ViewStyle = {
  borderWidth: 2,
  borderColor: color.primary,
  borderRadius: 5,
}
const CARD_HEADER: ViewStyle = {
  backgroundColor: color.primary,
  paddingVertical: spacing.smaller
}
const SPRITE: ImageStyle = {
  alignSelf: "center",
  height: 125,
  width: 125,
}
const DETAIL_CARD: ViewStyle = {
  alignSelf: "center",
  borderWidth: 2,
  borderColor: color.text,
  borderRadius: 5,
  marginVertical: spacing.smaller,
  padding: spacing.smaller
}
const DETAIL_TITLE: ViewStyle = {
  alignSelf: "center",
  borderBottomWidth: 1,
  borderBottomColor: color.text,
  marginBottom: spacing.tiny
}

export const EvolutionsScreen = observer(function EvolutionsScreen() {
  const { speciesStore, evolutionStore } = useStores()
  const { selected } = speciesStore
  const { evolutions } = evolutionStore

  const { width } = useWindowDimensions();

  useEffect(() => {
    if (!selected) return
    console.tron.log('new seelction made, do stuff')

    async function fetchData() {
      await evolutionStore.getChain(selected.evolution_chain, selected.name)
    }

    fetchData()
  }, [selected])

  // useEffect(() => {
  //   if (!evolutions.length || !selected) return

  //   async function fetchData() {
  //     console.tron.log(`fetching data: ${selected.name}`)
  //     await speciesStore.getPokemonData(selected.name)
  //   }

  //   fetchData()
  // }, [evolutions])

  const renderSprite = (species: Species) => {
    const variety = species.varieties?.find((variety) => variety.is_default)
    return variety ? 
    <Image style={SPRITE} source={{ uri: variety.pokemon.sprites.front_default }} /> :
    <Image style={SPRITE} source={{ uri: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png" }} />
  }

  const renderDetails = (details: EvolutionDetails[]) => (
    details.map((detail, i) => {
      detail = detail.clean()
      return (
        <View style={DETAIL_CARD} key={`detail-${i++}`}>
          {details.length > 1 &&
            <View style={DETAIL_TITLE}>
              <Text txOptions={{ num: i }} tx="evolutionsScreen.detailTitle" />
            </View>}
          {Object.keys(detail).map((key) => (
            <Text key={`detail-${i}-${key}`}>
              <Text preset="bold" text={`${key}: `} />{detail[key]}
            </Text>
          ))}
        </View>
      )
    })
  )

  const renderItem = ({ item, index }) => (
    <TouchableOpacity style={CARD} onPress={() => speciesStore.select(item.species.name)}>
      <View style={CARD_HEADER}>
        <Text preset="bold" style={TEXT} text={capitalize(item.species.name)} />
      </View>
      {/* // TODO: fix, causing errors */}
      {renderSprite(item.species)}
      {renderDetails(item.evolution_details)}
    </TouchableOpacity>
  )

  return (
    <Screen style={ROOT} preset="fixed" unsafe={true}>
      <Text style={TEXT_CONTAINER} preset="header" tx="evolutionsScreen.title" />
      {!selected ? (
        <Text style={TEXT} tx="evolutionsScreen.noSelection" />
      ) : (
        <Carousel
          data={evolutions}
          renderItem={renderItem}
          sliderWidth={width}
          itemWidth={width - 100} />
      )}
    </Screen>
  )
})
