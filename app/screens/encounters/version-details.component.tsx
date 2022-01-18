import * as React from "react"
import { FlatList, View, ViewStyle } from "react-native"
import { Text } from "../../components"
import { VersionDetail } from "../../models/encounter/version-detail"
import { EncounterDetail } from "../../models/encounter/encounter-detail"
import { color, spacing } from "../../theme"

const ROOT: ViewStyle = {
  marginTop: spacing.small
}
const ITEM: ViewStyle = {
  borderWidth: 2,
  borderColor: color.line,
  borderRadius: 5,
  padding: spacing.small,
  marginBottom: spacing.small
}

export interface VersionDetailsProps {
  versionDetails: VersionDetail[]
}

export const VersionDetails = function VersionDetails(props: VersionDetailsProps) {
  const { versionDetails } = props

  const renderItem = ({ item }) => {
    return (
      <View style={ROOT}>
        {item.encounter_details.map((encounterDetail, i) => (
          <View style={ITEM} key={`encounter-detail-${i++}`}>
            <Text txOptions={{ method: encounterDetail.method }} tx="encountersScreen.method" />
            <Text txOptions={{ chance: encounterDetail.chance }} tx="encountersScreen.chance" />
            <Text txOptions={{ level: encounterDetail.min_level }} tx="encountersScreen.minLevel" />
            <Text txOptions={{ level: encounterDetail.max_level }} tx="encountersScreen.maxLevel" />
            {/* <>
              {encounterDetail.condition_values.length && (
                <>
                  <Text tx="encountersScreen.conditions" />
                  {encounterDetail.condition_values.map((conditionValue, i) => (<Text key={`encounter-detail-condition-${i}`} text={conditionValue} />))}
                </>)
              }
            </> */}
          </View>
        ))}
      </View>
    )
  }

  return (
    <FlatList
      data={versionDetails}
      renderItem={renderItem}
      keyExtractor={(item, index) => String(index)} />
  )
}
