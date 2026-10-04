import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { CommonActions } from "@react-navigation/native";
import { BottomNavigation } from "react-native-paper";

export function MaterialTabBar({
  state,
  descriptors,
  navigation,
  insets,
}: BottomTabBarProps) {
  return (
    <BottomNavigation.Bar
      navigationState={state}
      safeAreaInsets={insets}
      onTabPress={({ route, preventDefault }) => {
        const event = navigation.emit({
          type: "tabPress",
          target: route.key,
          canPreventDefault: true,
        });

        if (event.defaultPrevented) {
          preventDefault();
          return;
        }

        if (state.routes[state.index].key !== route.key) {
          navigation.dispatch({
            ...CommonActions.navigate(route.name, route.params),
            target: state.key,
          });
        }
      }}
      onTabLongPress={({ route }) => {
        navigation.emit({ type: "tabLongPress", target: route.key });
      }}
      renderIcon={({ route, focused, color }) =>
        descriptors[route.key].options.tabBarIcon?.({
          focused,
          color,
          size: 24,
        }) ?? null
      }
      getLabelText={({ route }) => {
        const { tabBarLabel, title } = descriptors[route.key].options;
        return typeof tabBarLabel === "string"
          ? tabBarLabel
          : title ?? route.name;
      }}
      getBadge={({ route }) => descriptors[route.key].options.tabBarBadge}
      getAccessibilityLabel={({ route }) =>
        descriptors[route.key].options.tabBarAccessibilityLabel
      }
      getTestID={({ route }) =>
        descriptors[route.key].options.tabBarButtonTestID
      }
    />
  );
}
