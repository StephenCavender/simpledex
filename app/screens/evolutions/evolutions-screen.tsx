import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import {
  View,
  ViewStyle,
  TouchableOpacity,
  TextStyle,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native"
import { Screen, Text, Sprite, Card } from "../../components"
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
const DETAIL_CARD: ViewStyle = {
  alignSelf: "center",
  borderWidth: 2,
  borderColor: color.text,
  borderRadius: 5,
  marginVertical: spacing.small,
  padding: spacing.smaller,
}
const DETAIL_TITLE: ViewStyle = {
  alignSelf: "center",
  borderBottomWidth: 1,
  borderBottomColor: color.text,
  marginBottom: spacing.tiny,
}

export const EvolutionsScreen = observer(function EvolutionsScreen() {
  const { speciesStore, evolutionStore } = useStores()
  const { selected } = speciesStore
  const { evolutions } = evolutionStore

  const { width } = useWindowDimensions()

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

  const renderSprite = (species: Species) => {
    const variety = species.varieties?.find((variety) => variety.is_default)
    return variety ? (
      <Sprite uri={variety.pokemon.sprites.front_default} />
    ) : (
      <Sprite uri="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png" />
    )
  }

  const renderDetails = (details: EvolutionDetails[]) =>
    details.map((detail, i) => {
      detail = detail.clean()
      return (
        <View style={DETAIL_CARD} key={`evolution-detail-${i}`}>
          {details.length > 1 && (
            <View style={DETAIL_TITLE}>
              <Text txOptions={{ num: i }} tx="evolutionsScreen.detailTitle" />
            </View>
          )}
          {Object.keys(detail).map((key) => (
            <Text key={`evolution-detail-${i}-${key}`}>
              <Text preset="bold" text={`${key}: `} />
              {detail[key]}
            </Text>
          ))}
        </View>
      )
    })

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => speciesStore.select(item.species.name)}>
      <Card title={capitalize(item.species.name)}>
        {renderSprite(item.species)}
        {renderDetails(item.evolution_details)}
      </Card>
    </TouchableOpacity>
  )

  return (
    <Screen style={ROOT} preset="fixed" unsafe>
      <Text style={HEADER_CONTAINER} preset="header" tx="evolutionsScreen.title" />
      {loading ? (
        <ActivityIndicator size="large" color={color.secondary} />
      ) : (
        <>
          {!selected ? (
            <Text style={TEXT} tx="evolutionsScreen.noSelection" />
          ) : (
            <>
              {evolutions.length ? (
                <Carousel
                  data={evolutions}
                  renderItem={renderItem}
                  sliderWidth={width}
                  itemWidth={width - spacing.huge}
                />
              ) : (
                <Text
                  txOptions={{ species: capitalize(selected.name) }}
                  tx="evolutionsScreen.noEvolutions"
                />
              )}
            </>
          )}
        </>
      )}
    </Screen>
  )
})
