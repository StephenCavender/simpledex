import "../global.css";

import { ConvexProvider } from "convex/react";
import { Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { convex } from "@/lib/convex";
import { useNavigationTheme } from "@/lib/navigation-theme";
import { restoreThemePreference } from "@/lib/theme-preference";

restoreThemePreference();

export default function RootLayout(): React.JSX.Element {
  const theme = useNavigationTheme();
  return (
    <ConvexProvider client={convex}>
      <ThemeProvider value={theme}>
        <Stack>
          <Stack.Screen name="index" options={{ title: "SimpleDex" }} />
          <Stack.Screen name="about" options={{ title: "About" }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ConvexProvider>
  );
}
