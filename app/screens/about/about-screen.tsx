import React from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, ImageStyle, TextStyle, Pressable, View, Linking, TouchableOpacityProps } from "react-native"
import { Screen, Text, Icon, AutoImage as Image } from "../../components"
import { TxKeyPath } from "../../i18n"
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
  marginBottom: 20
}
const LINKS_CONTAINER: ViewStyle = {
  alignItems: "flex-end",
  alignSelf: "stretch",
  borderTopWidth: 1,
  borderTopColor: color.primary,
  borderBottomWidth: 1,
  borderBottomColor: color.primary
}
const LINK_SEPARATOR: ViewStyle = {
  borderTopWidth: 1,
  borderTopColor: color.primary,
  width: "95%"
}
const LINK_CONTAINER: ViewStyle = {
  padding: 10,
  flexDirection: 'row',
  alignItems: 'center',
  marginLeft: 10,
}
const LINK_ICON_CONTAINER: ViewStyle = {
  flexGrow: 1,
  alignItems: "flex-end"
}
const LINK_ICON: ImageStyle = {
  tintColor: color.primary
}

interface LinkProps extends TouchableOpacityProps {
  titleTx: TxKeyPath,
  url: string
}

export const AboutScreen = observer(function AboutScreen() {
  function Link(props: LinkProps) {
    const subtitle = props.url.replace(/^(https?:|)\/\//, '')
    return (
      <Pressable style={LINK_CONTAINER} onPress={() => Linking.openURL(props.url)}>
        <View>
          <Text preset="bold" tx={props.titleTx} />
          <Text preset="fieldLabel" text={subtitle} />
        </View>
        <Icon containerStyle={LINK_ICON_CONTAINER} icon="externalLink" style={LINK_ICON} />
      </Pressable>
    )
  }

  return (
    <Screen style={ROOT} preset="fixed">
      <Text preset="header" tx="aboutScreen.title" />
      <Image source={appLogo} style={[LOGO, APP_LOGO]} />
      {/* Version */}
      <View style={LINKS_CONTAINER}>
        <Link
          titleTx="aboutScreen.developer"
          url="https://dev.cavender.io" />
        <View style={LINK_SEPARATOR} />
        <Link
          titleTx="aboutScreen.project"
          url="https://simpledex.cavender.io" />
        <View style={LINK_SEPARATOR} />
        <Link
          titleTx="aboutScreen.pokeApi"
          url="https://pokeapi.co" />
      </View>
      <View>
        <Text style={API_TEXT} tx="aboutScreen.poweredBy" />
        <Image source={pokeapiLogo} style={[LOGO, API_LOGO]} />
      </View>
    </Screen>
  )
})
