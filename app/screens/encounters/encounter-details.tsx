import * as React from "react"
import { FlatList, View, ViewStyle } from "react-native"
import { Text, BulletItem } from "../../components"
import { EncounterDetail } from "../../models/encounter/encounter-detail"
import { color, spacing } from "../../theme"

const ROOT: ViewStyle = {
  marginTop: spacing.small,
}
const ITEM: ViewStyle = {
  borderWidth: 2,
  borderColor: color.line,
  borderRadius: 5,
  padding: spacing.small,
  marginBottom: spacing.small,
}

export interface EncounterDetailsProps {
  encounterDetails: EncounterDetail[]
}

export const EncounterDetails = function EncounterDetails(props: EncounterDetailsProps) {
  const { encounterDetails } = props

  const renderItem = ({ item }) => {
    console.tron.log('test', item)
    return (
      <View style={ROOT}>
          <View style={ITEM}>
            <Text txOptions={{ method: item.method }} tx="encountersScreen.method" />
            <Text txOptions={{ chance: item.chance }} tx="encountersScreen.chance" />
            <Text txOptions={{ level: item.min_level }} tx="encountersScreen.minLevel" />
            <Text txOptions={{ level: item.max_level }} tx="encountersScreen.maxLevel" />
            {item.condition_values.length > 0 && (
              <>
                <Text tx="encountersScreen.conditions" />
                {item.condition_values.map((conditionValue, i) => (
                  <BulletItem key={`encounter-detail-condition-${i}`} text={conditionValue} />
                ))}
              </>
            )}
          </View>
      </View>
    )
  }

  return (
    <FlatList
      data={encounterDetails}
      renderItem={renderItem}
      keyExtractor={(item, index) => String(index)}
    />
  )
}
