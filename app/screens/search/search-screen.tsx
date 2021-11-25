import React from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, View, TextStyle } from "react-native"
import { Screen, Text, GradientBackground, Header } from "../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, spacing, typography } from "../../theme"

const FULL: ViewStyle = { flex: 1, backgroundColor: color.palette.black }
const CONTAINER: ViewStyle = {
  backgroundColor: color.transparent,
  paddingHorizontal: spacing[4],
}
const TEXT: TextStyle = {
  color: color.palette.white,
  fontFamily: typography.primary,
}
const BOLD: TextStyle = { fontWeight: "bold" }
const HEADER: TextStyle = {
  paddingTop: spacing[3],
  paddingBottom: spacing[4] + spacing[1],
  paddingHorizontal: 0,
}
const HEADER_TITLE: TextStyle = {
  ...TEXT,
  ...BOLD,
  fontSize: 12,
  lineHeight: 15,
  textAlign: "center",
  letterSpacing: 1.5,
}

export const SearchScreen = observer(function SearchScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  // Pull in navigation via hook
  // const navigation = useNavigation()
  return (
    <View testID="SearchScreen" style={FULL}>

      {/* <GradientBackground colors={["#422443", "#281b34"]} /> */}
      <Screen style={CONTAINER} preset="scroll"  backgroundColor={color.transparent}>
        <Header headerTx="welcomeScreen.poweredBy" style={HEADER} titleStyle={HEADER_TITLE} rightIcon={"back"} onRightPress={null} />
        {/* // TODO: get info icon, pop info screen */}
      </Screen>
    </View>
  )
})
