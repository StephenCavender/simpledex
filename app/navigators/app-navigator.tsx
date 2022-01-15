/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import React from "react"
import { ImageStyle, useColorScheme } from "react-native"
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { EvolutionsScreen, EncountersScreen, AboutScreen, SearchScreen, FilterScreen } from "../screens"
import { navigationRef } from "./navigation-utilities"
import { Header, Icon } from "../components"
import { color } from "../theme"

export type TabParamList = {
  evolutions: undefined
  encounters: undefined
  about: undefined
}

const Tab = createBottomTabNavigator<TabParamList>()

const ICON: ImageStyle = { tintColor: color.primary, width: 24 }

const AppTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        header: function header() {
          return <Header />
        },
        tabBarStyle: { backgroundColor: color.background },
        tabBarActiveTintColor: color.primary,
      }}
    >
      <Tab.Screen
        name="evolutions"
        component={EvolutionsScreen}
        options={{
          tabBarIcon: function tabBarIcon({ color }) {
            return <Icon icon="refreshCw" style={[ICON, { tintColor: color }]} />
          },
        }}
      />
      <Tab.Screen
        name="encounters"
        component={EncountersScreen}
        options={{
          tabBarIcon: function tabBarIcon({ color }) {
            return <Icon icon="mapPin" style={[ICON, { tintColor: color }]} />
          },
        }}
      />
      <Tab.Screen
        name="about"
        component={AboutScreen}
        options={{
          tabBarIcon: function tabBarIcon({ color }) {
            return <Icon icon="info" style={[ICON, { tintColor: color }]} />
          },
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  )
}

/**
 * This type allows TypeScript to know what routes are defined in this navigator
 * as well as what properties (if any) they might take when navigating to them.
 *
 * If no params are allowed, pass through `undefined`. Generally speaking, we
 * recommend using your MobX-State-Tree store(s) to keep application state
 * rather than passing state through navigation params.
 *
 * For more information, see this documentation:
 *   https://reactnavigation.org/docs/params/
 *   https://reactnavigation.org/docs/typescript#type-checking-the-navigator
 */
export type StackParamList = {
  tabs: undefined
  search: undefined
  filter: undefined
}

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<StackParamList>()

const AppStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="tabs"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="tabs" component={AppTabs} />
      <Stack.Screen options={{ presentation: "modal" }} name="search" component={SearchScreen} />
      <Stack.Screen options={{ presentation: "modal" }} name="filter" component={FilterScreen} />
    </Stack.Navigator>
  )
}

interface NavigationProps extends Partial<React.ComponentProps<typeof NavigationContainer>> {}

export const AppNavigator = (props: NavigationProps) => {
  const colorScheme = useColorScheme()
  return (
    <NavigationContainer
      ref={navigationRef}
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      {...props}
    >
      <AppStack />
    </NavigationContainer>
  )
}

AppNavigator.displayName = "AppNavigator"

/**
 * A list of routes from which we're allowed to leave the app when
 * the user presses the back button on Android.
 *
 * Anything not on this list will be a standard `back` action in
 * react-navigation.
 *
 * `canExit` is used in ./app/app.tsx in the `useBackButtonHandler` hook.
 */
const exitRoutes = ["welcome"]
export const canExit = (routeName: string) => exitRoutes.includes(routeName)
