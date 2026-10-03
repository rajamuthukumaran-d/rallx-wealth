import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { MaterialTabBar } from "@/components/material-tab-bar";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <MaterialTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }: { color: string }) => (
            <MaterialCommunityIcons name="home" color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
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
      <Tabs.Screen
        name="(net-worth)/index"
        options={{
          title: "Net Worth",
          tabBarIcon: ({ color }: { color: string }) => (
            <FontAwesome6 name="money-bill-wave" color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }: { color: string }) => (
            <MaterialCommunityIcons name="cog" color={color} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}
