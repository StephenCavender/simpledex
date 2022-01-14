import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle, TouchableOpacity, TextStyle, ImageStyle, useWindowDimensions, ActivityIndicator } from "react-native"
import { Screen, Text, AutoImage as Image, Card } from "../../components"
import { EvolutionDetails, Species, useStores } from "../../models"
import { color, spacing } from "../../theme"
import { capitalize } from "lodash"
import Carousel from "react-native-snap-carousel"

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
  alignItems: "center",
}
const HEADER_CONTAINER: ViewStyle = {
  marginBottom: 10,
}
const TEXT: TextStyle = {
  textAlign: "center",
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

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selected) return

    setLoading(true)
    async function fetchData() {
      await evolutionStore.getChain(selected.evolution_chain, selected.name)
      setLoading(false)
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
    // TODO: sprite not loading on selection
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

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => speciesStore.select(item.species.name)}>
      <Card title={capitalize(item.species.name)}>
        {renderSprite(item.species)}
        {renderDetails(item.evolution_details)}
      </Card>
    </TouchableOpacity>
  )

  return (
    <Screen style={ROOT} preset="fixed" unsafe={true}>
      <Text style={HEADER_CONTAINER} preset="header" tx="evolutionsScreen.title" />
      {loading ? <ActivityIndicator /> : 
      <>
        {!selected ? (
          <Text style={TEXT} tx="evolutionsScreen.noSelection" />
        ) : (
          <>
            {evolutions.length ? 
            <Carousel
              data={evolutions}
              renderItem={renderItem}
              sliderWidth={width}
              itemWidth={width - 50} /> :
            <Text
              txOptions={{ species: capitalize(selected.name) }}
              tx="evolutionsScreen.noEvolutions"
            />
          }
          </>
        )}
      </>
      }
      {/* {!selected ? (
        <Text style={TEXT} tx="evolutionsScreen.noSelection" />
      ) : (
        <Carousel
          data={evolutions}
          renderItem={renderItem}
          sliderWidth={width}
          itemWidth={width - 100} />
      )} */}
    </Screen>
  )
})
