import * as React from "react"
import { FlatList, View, ViewStyle } from "react-native"
import { Text } from "../../components"
import { VersionDetail } from "../../models/encounter/version-detail"
import { EncounterDetail } from "../../models/encounter/encounter-detail"
import { color, spacing } from "../../theme"

const ROOT: ViewStyle = {
  borderWidth: 2,
  borderColor: color.line
}

export interface VersionDetailsProps {
  versionDetails: VersionDetail[]
}

export const VersionDetails = function VersionDetails(props: VersionDetailsProps) {
  const { versionDetails } = props

  const renderItem = ({ item }) => {
    return (
      <View style={ROOT}>
        {item.encounter_details.map(encounterDetail => (
          <>
          <Text txOptions={{ method: encounterDetail.method }} tx="encountersScreen.method" />
          <Text txOptions={{ chance: encounterDetail.chance }} tx="encountersScreen.chance" />
          </>
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
