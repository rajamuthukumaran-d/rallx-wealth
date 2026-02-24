import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavLightTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import "../../global.css";
import {
  DarkTheme,
  LightTheme,
  reactNativePaperDark,
  reactNativePaperLight,
} from "../config/rallx-purple-theme";

const paperDark = {
  ...MD3DarkTheme,
  colors: { ...MD3DarkTheme.colors, ...reactNativePaperDark.colors },
};
const paperLight = {
  ...MD3LightTheme,
  colors: { ...MD3LightTheme.colors, ...reactNativePaperLight.colors },
};

const navDark = {
  ...NavDarkTheme,
  ...DarkTheme,
  colors: { ...NavDarkTheme.colors, ...DarkTheme.colors },
};
const navLight = {
  ...NavLightTheme,
  ...LightTheme,
  colors: { ...NavLightTheme.colors, ...LightTheme.colors },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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
