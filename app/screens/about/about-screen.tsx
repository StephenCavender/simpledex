import React from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, ImageStyle, TextStyle, Pressable, View, TouchableOpacityProps } from "react-native"
import { Screen, Text, Icon, AutoImage as Image } from "../../components"
import { TxKeyPath } from "../../i18n"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color } from "../../theme"

const appLogo = require("./app-logo.png")
const pokeapiLogo = require("./pokeapi-logo.png")

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
  alignItems: "center",
  justifyContent: "space-between"
}
const LOGO: ImageStyle = {
  resizeMode: "contain"
}
const APP_LOGO: ImageStyle = {
  height: 150,
}
const API_TEXT: TextStyle = {
  textAlign: "center"
}
const API_LOGO: ImageStyle = {
  height: 50,
  marginBottom: 50
}

interface LinkProps extends TouchableOpacityProps {
  titleTx: TxKeyPath,
  url: string
}

export const AboutScreen = observer(function AboutScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  // Pull in navigation via hook
  // const navigation = useNavigation()
  function Link(props: LinkProps) {
    // TODO: get subtitle from url
    const subtitle = "TODO"
    return (
      <Pressable>
        <View>
          <Text tx={props.titleTx} />
          <Text text={subtitle} />
        </View>
        <View>
          <Icon icon="chevronRight" />
        </View>
      </Pressable>
    )
  }

  return (
    <Screen style={ROOT} preset="scroll">
      <Text preset="header" tx="aboutScreen.title" />
      <Image source={appLogo} style={[LOGO, APP_LOGO]} />
      {/* Version */}
      <View>
        <Link
          titleTx="aboutScreen.developer"
          url="https://dev.cavender.io" />
        <Link
          titleTx="aboutScreen.project"
          url="https://simpledex.cavender.io" />
      </View>
      <View>
        <Text style={API_TEXT} tx="aboutScreen.poweredBy" />
        <Image source={pokeapiLogo} style={[LOGO, API_LOGO]} />
      </View>
    </Screen>
  )
})
