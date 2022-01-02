import React from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, ImageStyle, Pressable, View, TouchableOpacityProps } from "react-native"
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
}
const IMAGE: ImageStyle = {
  width: 150,
  resizeMode: "contain"
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
      <Image source={appLogo} style={IMAGE} />
      {/* Version */}
      <View>
        <Link
          titleTx="aboutScreen.developer"
          url="https://simpledex.cavender.io/" />
        <Link
          titleTx="aboutScreen.developer"
          url="https://simpledex.cavender.io/" />
      </View>
      <Image source={pokeapiLogo} style={IMAGE} />
    </Screen>
  )
})
