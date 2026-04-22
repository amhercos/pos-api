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
import React, { useCallback, useMemo } from "react";
import { Platform, TouchableOpacity, useWindowDimensions } from "react-native";
import { drawerNavigationRef } from "../../src/utils/drawerRef";

export default function TabLayout(): React.JSX.Element {
  const navigation = useNavigation<BottomTabNavigationProp<ParamListBase>>();
  const { width, height } = useWindowDimensions();

  const isTablet = width >= 768;
  const isLandscape = width > height;

  const handleOpenDrawer = useCallback((): void => {
    // Attempt to use the ref, fallback to local navigation
    const nav = (drawerNavigationRef.current ||
      navigation) as DrawerNavigationProp<ParamListBase>;
    nav.dispatch(DrawerActions.openDrawer());
  }, [navigation]);

  const screenOptions = useMemo(
    () => ({
      headerShown: true,
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: "#ffffff",
        height: Platform.OS === "ios" ? 110 : 70,
      },
      headerTitleStyle: {
        fontWeight: "800" as const,
        fontSize: 18,
        color: "#0f172a",
      },
      headerLeft: () => (
        <TouchableOpacity
          onPress={handleOpenDrawer}
          className="ml-5 p-2 bg-slate-50 rounded-xl"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Menu size={20} color="#0f172a" strokeWidth={2.5} />
        </TouchableOpacity>
      ),
      tabBarActiveTintColor: "#2563eb",
      tabBarInactiveTintColor: "#94a3b8",
      tabBarLabelStyle: { fontWeight: "600" as const, fontSize: 11 },
      tabBarStyle: {
        height: isLandscape ? 60 : 75,
        paddingBottom: Platform.OS === "ios" ? 25 : 12,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9",
        backgroundColor: "#ffffff",
        elevation: 0,
        paddingHorizontal: isTablet ? width * 0.15 : 0,
      },
    }),
    [handleOpenDrawer, isLandscape, isTablet, width],
  );

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="dashboard"
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
          title: "Point of Sale",
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
          title: "Customer Credits",
          tabBarLabel: "Credits",
          tabBarIcon: ({ color }) => <Receipt size={22} color={color} />,
        }}
      />

      {/* Hidden Utility Routes */}
      <Tabs.Screen name="reports" options={{ href: null }} />
      <Tabs.Screen name="pricing" options={{ href: null }} />
    </Tabs>
  );
}
