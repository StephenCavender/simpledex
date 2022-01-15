import * as React from "react"
import { storiesOf } from "@storybook/react-native"
import { StoryScreen, Story, UseCase } from "../../../storybook/views"
import { color } from "../../theme"
import { ModalDismissIndicator } from "./modal-dismiss-indicator"

storiesOf("ModalDismissIndicator", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Primary" usage="The primary.">
        <ModalDismissIndicator style={{ backgroundColor: color.error }} />
      </UseCase>
    </Story>
  ))
