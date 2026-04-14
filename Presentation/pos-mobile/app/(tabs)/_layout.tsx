import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Tabs } from "expo-router";
import {
  BarChart3,
  LayoutDashboard,
  Menu,
  Package,
  Receipt,
  ShoppingCart,
  Tag,
} from "lucide-react-native";
import React from "react";
import { TouchableOpacity } from "react-native";

export default function TabLayout() {
  const navigation = useNavigation();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: "#ffffff",
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontWeight: "800",
          fontSize: 18,
          color: "#0f172a",
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            className="ml-5 p-2 bg-slate-50 rounded-xl"
          >
            <Menu size={20} color="#0f172a" />
          </TouchableOpacity>
        ),
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          height: 80, // Increased slightly for comfort
          paddingBottom: 20,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: "#f1f5f9",
          backgroundColor: "#ffffff",
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <LayoutDashboard size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="sales"
        options={{
          title: "New Sale",
          tabBarLabel: "Sale",
          tabBarIcon: ({ color }) => <ShoppingCart size={22} color={color} />,
        }}
      />

      <Tabs.Screen
        name="inventory"
        options={{
          title: "Inventory",
          tabBarLabel: "Stock",
          tabBarIcon: ({ color }) => <Package size={22} color={color} />,
        }}
      />

      {/* New: Credit/Debt Navigation */}
      <Tabs.Screen
        name="credits"
        options={{
          title: "Credit & Debt",
          tabBarLabel: "Credits",
          tabBarIcon: ({ color }) => <Receipt size={22} color={color} />,
        }}
      />

      {/* New: Special Pricing Navigation */}
      <Tabs.Screen
        name="pricing"
        options={{
          title: "Special Pricing",
          tabBarLabel: "Pricing",
          tabBarIcon: ({ color }) => <Tag size={22} color={color} />,
        }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          title: "Analytics",
          tabBarLabel: "Reports",
          tabBarIcon: ({ color }) => <BarChart3 size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
