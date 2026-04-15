import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Tabs } from "expo-router";
import {
  LayoutDashboard,
  Menu,
  Package,
  Receipt,
  ShoppingCart,
} from "lucide-react-native";
import React from "react";
import { Platform, TouchableOpacity, useWindowDimensions } from "react-native";

export default function TabLayout() {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;
  const isTablet = width >= 768;

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: "#ffffff",
          height: Platform.OS === "ios" ? 100 : 60, // Compact header
        },
        headerTitleStyle: {
          fontWeight: "800",
          fontSize: 16, // Slightly smaller
          color: "#0f172a",
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            className="ml-4 p-1.5 bg-slate-50 rounded-lg"
          >
            <Menu size={18} color="#0f172a" />
          </TouchableOpacity>
        ),
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#94a3b8",

        // --- COMPACT BOTTOM BAR DESIGN ---
        tabBarStyle: {
          height: isLandscape ? 50 : 65, // Reduced from 80
          paddingBottom: Platform.OS === "ios" ? 20 : 8, // Optimized for safe areas
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: "#f1f5f9",
          backgroundColor: "#ffffff",
          elevation: 0,
          paddingHorizontal: isTablet ? width * 0.1 : 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: -4, // Pull label closer to icon
          display: isLandscape && !isTablet ? "none" : "flex",
        },
        tabBarIconStyle: {
          marginBottom: 0, // Remove default spacing
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <LayoutDashboard size={20} color={color} /> // Reduced from 22
          ),
        }}
      />

      <Tabs.Screen
        name="sales"
        options={{
          title: "New Sale",
          tabBarLabel: "Sale",
          tabBarIcon: ({ color }) => <ShoppingCart size={20} color={color} />,
        }}
      />

      <Tabs.Screen
        name="inventory"
        options={{
          title: "Inventory",
          tabBarLabel: "Stock",
          tabBarIcon: ({ color }) => <Package size={20} color={color} />,
        }}
      />

      <Tabs.Screen
        name="credits"
        options={{
          title: "Credits",
          tabBarLabel: "Credits",
          tabBarIcon: ({ color }) => <Receipt size={20} color={color} />,
        }}
      />

      {/* Hidden Tabs */}
      <Tabs.Screen name="reports" options={{ href: null, title: "Reports" }} />
      <Tabs.Screen
        name="pricing"
        options={{ href: null, title: "Special Pricing" }}
      />
    </Tabs>
  );
}
