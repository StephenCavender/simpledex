import React, { useEffect } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, TouchableOpacity, FlatList, TextStyle, ImageStyle, useWindowDimensions } from "react-native"
import { Screen, Text, AutoImage as Image } from "../../components"
import { EvolutionDetails, Species, useStores } from "../../models"
import { color } from "../../theme"
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
const SPRITE: ImageStyle = {
  height: 125,
  width: 125,
}

export const EvolutionsScreen = observer(function EvolutionsScreen() {
  const { speciesStore, evolutionStore } = useStores()
  const { selected } = speciesStore
  const { evolutions } = evolutionStore

  const { width } = useWindowDimensions();

  useEffect(() => {
    if (!selected) return

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
    const variety = species.varieties.find((variety) => variety.is_default)
    return <Image style={SPRITE} source={{ uri: variety.pokemon.sprites.front_default }} />
  }

  const renderDetails = (details: EvolutionDetails[]) => {
    details.forEach(detail => {
      // TODO: render card for these deets
      for (const [key, value] of Object.entries(detail)) {
        // TODO: rm null pairs
        // console.tron.log(`${key}: ${value}`);
      }
    })
  }

  const renderItem = ({ item, index }) => (
    <TouchableOpacity onPress={() => speciesStore.select(item.species.name)}>
      <Text style={TEXT} text={capitalize(item.species.name)} />
      {/* // TODO: fix, causing errors */}
      {/* {renderSprite(item.species)} */}
      {renderDetails(item.evolution_details)}
    </TouchableOpacity>
  )

  return (
    <Screen style={ROOT} preset="fixed" unsafe={true}>
      <Text style={TEXT_CONTAINER} preset="header" tx="evolutionsScreen.title" />
      {!selected ? (
        <Text style={TEXT} tx="evolutionsScreen.noSelection" />
      ) : (
        // TODO: Style a card
        // TODO: impl swiper
        <>
        <Carousel
          data={evolutions}
          renderItem={renderItem}
          sliderWidth={width}
          itemWidth={width} />
        <FlatList
          data={[...evolutions]}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text
              txOptions={{ species: capitalize(selected.name) }}
              tx="evolutionsScreen.noEvolutions"
            />
          }
        />
        </>
      )}
    </Screen>
  )
})
