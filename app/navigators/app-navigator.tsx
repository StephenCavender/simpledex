/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import React from "react"
import { useColorScheme } from "react-native"
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native"
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { EvolutionsScreen, LocationsScreen, AboutScreen } from "../screens"
import { navigationRef } from "./navigation-utilities"
import { Header, Icon } from "../components";
import { color } from "../theme"

export type TabParamList = {
  evolutions: undefined
  locations: undefined
  about: undefined
}

const Tab = createBottomTabNavigator<TabParamList>()

const AppTabs = () => {
  return (
    <Tab.Navigator screenOptions={{
      header: () => ( <Header /> ),
      tabBarStyle: { backgroundColor: color.background },
      tabBarActiveTintColor: color.primary }}>
      <Tab.Screen
        name="evolutions"
        component={EvolutionsScreen}
        options={{
          tabBarIcon: ({color}) => (<Icon icon="refreshCw" style={{ tintColor: color, width: 24 }} />)
        }}/>
      <Tab.Screen
        name="locations"
        component={LocationsScreen}
        options={{
          tabBarIcon: ({color}) => (<Icon icon="mapPin" style={{ tintColor: color, width: 24 }} />),
          
        }}/>
        <Tab.Screen
          name="about"
          component={AboutScreen}
          options={{
            tabBarIcon: ({color}) => (<Icon icon="info" style={{ tintColor: color, width: 24 }} />),
            headerShown: false
          }}/>
    </Tab.Navigator>
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
      <AppTabs />
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
