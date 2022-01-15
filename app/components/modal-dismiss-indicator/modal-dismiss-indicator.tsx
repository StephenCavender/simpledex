import * as React from "react"
import { View, ViewStyle } from "react-native"
import { color } from "../../theme"

const DISMISS_INDICATOR: ViewStyle = {
  backgroundColor: color.dim,
  height: 5,
  width: 50,
  borderRadius: 20,
  marginTop: 5,
  marginBottom: 15
}

/**
 * Small indicator to show modals can be swiped down to dismiss
 */
export const ModalDismissIndicator = () => <View style={DISMISS_INDICATOR} />
