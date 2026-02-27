import {
  isDynamicThemeSupported,
  useMaterial3Theme,
} from "@pchmn/expo-material3-theme";
import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavLightTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import "../../global.css";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { theme } = useMaterial3Theme({ fallbackSourceColor: "#9966cc" });

  const paperDark = {
    ...MD3DarkTheme,
    colors: theme.dark,
  };
  const paperLight = {
    ...MD3LightTheme,
    colors: theme.light,
  };

  const navDark = {
    ...NavDarkTheme,
    colors: {
      ...NavDarkTheme.colors,
      ...(isDynamicThemeSupported && {
        primary: theme.dark.primary,
        background: theme.dark.background,
        card: theme.dark.surface,
        text: theme.dark.onSurface,
        border: theme.dark.outline,
        notification: theme.dark.error,
      }),
    },
  };
  const navLight = {
    ...NavLightTheme,
    colors: {
      ...NavLightTheme.colors,
      ...(isDynamicThemeSupported && {
        primary: theme.light.primary,
        background: theme.light.background,
        card: theme.light.surface,
        text: theme.light.onSurface,
        border: theme.light.outline,
        notification: theme.light.error,
      }),
    },
  };

  return (
    <PaperProvider theme={isDark ? paperDark : paperLight}>
      <ThemeProvider value={isDark ? navDark : navLight}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </PaperProvider>
  );
}
