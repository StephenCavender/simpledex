import * as React from "react"
import { View, ViewStyle, Platform, TouchableOpacity, ImageStyle } from "react-native"
import { Icon } from "../icon/icon"
import { color, spacing } from "../../theme"
import { useNavigation } from "@react-navigation/native"

const DISMISS_INDICATOR: ViewStyle = {
  backgroundColor: color.dim,
  height: 5,
  width: 50,
  borderRadius: 20,
  marginVertical: spacing.medium
}
const RIGHT: ViewStyle = {
  alignItems: "flex-end",
  alignSelf: "stretch",
  padding: spacing.medium,
}
const ICON: ImageStyle = {
  tintColor: color.palette.lightGrey,
  width: 48,
}

/**
 * Small indicator to show modals can be dismissed
 * Swiper indicator on iOS
 * Close icon on Android
 */
export const ModalDismissIndicator = () => {
  const navigation = useNavigation()

  return Platform.OS === "ios" ? (
    <View style={DISMISS_INDICATOR} />
  ) : (
    <TouchableOpacity style={RIGHT} onPress={() => navigation.goBack()}>
      <Icon icon="x" style={ICON} />
    </TouchableOpacity>
  )
}
