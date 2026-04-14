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
import { TouchableOpacity, useWindowDimensions } from "react-native";

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
          height: isLandscape ? 65 : 80,
          paddingBottom: isLandscape ? 10 : 20,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: "#f1f5f9",
          backgroundColor: "#ffffff",
          elevation: 0,
          paddingHorizontal: isTablet && isLandscape ? width * 0.15 : 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          display: isLandscape && !isTablet ? "none" : "flex",
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

      <Tabs.Screen
        name="credits"
        options={{
          title: "Credit & Debt",
          tabBarLabel: "Credits",
          tabBarIcon: ({ color }) => <Receipt size={22} color={color} />,
        }}
      />

      {/* --- HIDDEN TABS --- */}
      {/* Remove the (tabs)/ prefix here. It just needs to be the filename */}
      <Tabs.Screen
        name="pricing"
        options={{
          href: null,
          title: "Special Pricing",
        }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          href: null,
          title: "Transaction Reports",
        }}
      />
    </Tabs>
  );
}
