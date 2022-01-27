import React from "react"
import { observer } from "mobx-react-lite"
import {
  ViewStyle,
  ImageStyle,
  TextStyle,
  TouchableOpacity,
  View,
  Linking,
  TouchableOpacityProps,
} from "react-native"
import { Screen, Text, Icon, AutoImage as Image, Button } from "../../components"
import { TxKeyPath } from "../../i18n"
import { color, spacing } from "../../theme"
import { getVersion } from "react-native-device-info"

const appLogo = require("./app-logo.png")
const pokeapiLogo = require("./pokeapi-logo.png")

const ROOT: ViewStyle = {
  backgroundColor: color.background,
  flex: 1,
  alignItems: "center",
  justifyContent: "space-around",
}
const LOGO_CONTAINER: ViewStyle = {
  alignItems: "center",
}
const LOGO: ImageStyle = {
  resizeMode: "contain",
  marginBottom: spacing.small,
}
const APP_LOGO: ImageStyle = {
  height: 150,
}
const API_TEXT: TextStyle = {
  textAlign: "center",
}
const API_LOGO: ImageStyle = {
  height: 50,
  marginBottom: 20,
}
const LINKS_CONTAINER: ViewStyle = {
  alignItems: "flex-end",
  alignSelf: "stretch",
  borderTopWidth: 1,
  borderTopColor: color.primary,
  borderBottomWidth: 1,
  borderBottomColor: color.primary,
}
const LINK_SEPARATOR: ViewStyle = {
  borderTopWidth: 1,
  borderTopColor: color.primary,
  width: "95%",
}
const LINK_CONTAINER: ViewStyle = {
  padding: 10,
  flexDirection: "row",
  alignItems: "center",
  marginLeft: 10,
}
const LINK_ICON_CONTAINER: ViewStyle = {
  flexGrow: 1,
  alignItems: "flex-end",
}
const LINK_ICON: ImageStyle = {
  tintColor: color.primary,
}
const ROW: ViewStyle = {
  flexDirection: "row",
  width: "80%",
  justifyContent: "space-around",
}
const LEGAL: TextStyle = {
  color: color.secondary,
  textDecorationLine: "underline",
}

interface LinkProps extends TouchableOpacityProps {
  titleTx: TxKeyPath
  url: string
}

export const AboutScreen = observer(function AboutScreen() {
  function Link(props: LinkProps) {
    const subtitle = props.url.replace(/^(https?:|)\/\//, "")
    return (
      <TouchableOpacity style={LINK_CONTAINER} onPress={() => Linking.openURL(props.url)}>
        <View>
          <Text preset="bold" tx={props.titleTx} />
          <Text preset="fieldLabel" text={subtitle} />
        </View>
        <Icon containerStyle={LINK_ICON_CONTAINER} icon="externalLink" style={LINK_ICON} />
      </TouchableOpacity>
    )
  }

  return (
    <Screen style={ROOT} preset="fixed">
      <Text preset="header" tx="aboutScreen.title" />
      {/* // TODO: missingno easter egg */}
      <View style={LOGO_CONTAINER}>
        <Image source={appLogo} style={[LOGO, APP_LOGO]} />
        <Text txOptions={{ version: getVersion() }} tx="aboutScreen.version" />
      </View>
      <View style={LINKS_CONTAINER}>
        <Link titleTx="aboutScreen.developer" url="https://dev.cavender.io" />
        <View style={LINK_SEPARATOR} />
        <Link titleTx="aboutScreen.project" url="https://simpledex.cavender.io" />
        <View style={LINK_SEPARATOR} />
        <Link titleTx="aboutScreen.pokeApi" url="https://pokeapi.co" />
      </View>
      <View style={ROW}>
        <Button
          preset="link"
          textStyle={LEGAL}
          tx="aboutScreen.privacyPolicy"
          onPress={() =>
            Linking.openURL(
              "https://user.fm/files/v2-891a62a0a61947b7e884d31505325a52/privacyPolicy.html",
            )
          }
        />
        <Button
          preset="link"
          textStyle={LEGAL}
          tx="aboutScreen.terms"
          onPress={() =>
            Linking.openURL(
              "https://user.fm/files/v2-b8cb3440d4c3c31ea2e126c0541d64ef/termsAndConditions.html",
            )
          }
        />
      </View>
      <View>
        <Text style={API_TEXT} tx="aboutScreen.poweredBy" />
        <Image source={pokeapiLogo} style={[LOGO, API_LOGO]} />
      </View>
    </Screen>
  )
})
