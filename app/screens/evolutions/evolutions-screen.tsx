import React, { useEffect } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, Pressable, FlatList, TextStyle } from "react-native"
import { Screen, Text } from "../../components"
import { useStores } from "../../models"
import { color } from "../../theme"
import { capitalize } from "lodash"

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

export const EvolutionsScreen = observer(function EvolutionsScreen() {
  const { speciesStore, evolutionStore } = useStores()
  const { selected } = speciesStore
  const { evolutions } = evolutionStore

  useEffect(() => {
    if (!selected) return

    async function fetchData() {
      evolutionStore.getChain(selected.evolution_chain, selected.name)
    }

    fetchData()
  }, [selected])

  const renderItem = ({ item }) => (
    <Pressable onPress={() => speciesStore.select(item.name)}>
      <Text text={capitalize(item.species.name)} />
    </Pressable>
  )

  return (
    <Screen style={ROOT} preset="fixed">
      <Text style={TEXT_CONTAINER} preset="header" tx="evolutionsScreen.title" />
      {!!selected ? (
        <FlatList
          data={[...evolutions]}
          renderItem={renderItem}
          listEmptyComponent={
            <Text
              txOptions={{ species: capitalize(selected.name) }}
              tx="evolutionsScreen.noEvolutions"
            />
          }
        />
      ) : (
        <Text style={TEXT} tx="evolutionsScreen.noSelection" />
      )}
    </Screen>
  )
})
