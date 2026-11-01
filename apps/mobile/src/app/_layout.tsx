import "../global.css";

import { ConvexProvider } from "convex/react";
import { Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { convex } from "@/lib/convex";
import { useNavigationTheme } from "@/lib/navigation-theme";

export default function RootLayout(): React.JSX.Element {
  const theme = useNavigationTheme();
  return (
    <ConvexProvider client={convex}>
      <ThemeProvider value={theme}>
        <Stack>
          <Stack.Screen name="index" options={{ title: "SimpleDex" }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ConvexProvider>
  );
}
