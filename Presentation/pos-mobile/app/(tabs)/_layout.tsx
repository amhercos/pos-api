import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import {
  DrawerActions,
  ParamListBase,
  useNavigation,
} from "@react-navigation/native";
import { Tabs } from "expo-router";
import {
  LayoutDashboard,
  Menu,
  Package,
  Receipt,
  ShoppingCart,
} from "lucide-react-native";
import React, { useCallback } from "react";
import { Platform, TouchableOpacity, useWindowDimensions } from "react-native";
import { drawerNavigationRef } from "../../src/utils/drawerRef";

export default function TabLayout(): React.JSX.Element {
  const navigation = useNavigation<BottomTabNavigationProp<ParamListBase>>();
  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;
  const isTablet = width >= 768;

  const handleOpenDrawer = useCallback((): void => {
    if (drawerNavigationRef.current) {
      (
        drawerNavigationRef.current as DrawerNavigationProp<ParamListBase>
      ).dispatch(DrawerActions.openDrawer());
    } else {
      navigation.dispatch(DrawerActions.openDrawer());
    }
  }, [navigation]);

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: "#ffffff",
          height: Platform.OS === "ios" ? 100 : 60,
        },
        headerTitleStyle: {
          fontWeight: "800",
          fontSize: 16,
          color: "#0f172a",
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={handleOpenDrawer}
            className="ml-4 p-1.5 bg-slate-50 rounded-lg"
          >
            <Menu size={18} color="#0f172a" />
          </TouchableOpacity>
        ),
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          height: isLandscape ? 50 : 65,
          paddingBottom: Platform.OS === "ios" ? 20 : 8,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: "#f1f5f9",
          backgroundColor: "#ffffff",
          elevation: 0,
          paddingHorizontal: isTablet ? width * 0.1 : 0,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <LayoutDashboard size={20} color={color} />
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

      {/* Hidden routes used for navigation but not displayed in the bottom bar */}
      <Tabs.Screen name="reports" options={{ href: null, title: "Reports" }} />
      <Tabs.Screen
        name="pricing"
        options={{ href: null, title: "Special Pricing" }}
      />
    </Tabs>
  );
}
