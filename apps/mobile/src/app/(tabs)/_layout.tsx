import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { withLayoutContext } from "expo-router";

const MaterialBottomTabs = withLayoutContext(
  createMaterialBottomTabNavigator().Navigator,
);

export default function TabLayout() {
  return (
    <MaterialBottomTabs>
      <MaterialBottomTabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }: { color: string }) => (
            <MaterialCommunityIcons name="home" color={color} size={24} />
          ),
        }}
      />
      <MaterialBottomTabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color }: { color: string }) => (
            <MaterialCommunityIcons
              name="format-list-bulleted"
              color={color}
              size={24}
            />
          ),
        }}
      />
      <MaterialBottomTabs.Screen
        name="(net-worth)/index"
        options={{
          title: "Net Worth",
          tabBarIcon: ({ color }: { color: string }) => (
            <FontAwesome6 name="money-bill-wave" color={color} size={24} />
          ),
        }}
      />
      <MaterialBottomTabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }: { color: string }) => (
            <MaterialCommunityIcons name="cog" color={color} size={24} />
          ),
        }}
      />
    </MaterialBottomTabs>
  );
}
