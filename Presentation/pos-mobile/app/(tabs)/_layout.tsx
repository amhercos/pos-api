import { DrawerActions } from "@react-navigation/native";
import { Tabs } from "expo-router";
import {
  LayoutDashboard,
  Menu,
  Package,
  Receipt,
  ShoppingCart,
} from "lucide-react-native";
import React, { memo, useCallback, useMemo } from "react";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { drawerNavigationRef } from "../../src/utils/drawerRef";

/**
 * Isolated Trigger Component.
 * This prevents the header from losing the navigation context.
 */
const DrawerTrigger = memo(() => {
  const handleOpenDrawer = useCallback((): void => {
    // Uses the global bridge to trigger the drawer without resetting the tab stack
    drawerNavigationRef.current?.dispatch(DrawerActions.openDrawer());
  }, []);

  return (
    <TouchableOpacity
      onPress={handleOpenDrawer}
      style={styles.headerButton}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Menu size={20} color="#0f172a" strokeWidth={2.5} />
    </TouchableOpacity>
  );
});
DrawerTrigger.displayName = "DrawerTrigger";

export default function TabLayout(): React.JSX.Element {
  const { width, height } = useWindowDimensions();

  const isTablet = width >= 768;
  const isLandscape = width > height;

  const screenOptions = useMemo(
    () => ({
      headerShown: true,
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: "#ffffff",
        height: Platform.OS === "ios" ? 110 : 70,
      },
      headerTitleStyle: styles.headerTitle,
      // Reference the component directly to maintain a stable render path
      headerLeft: () => <DrawerTrigger />,
      tabBarActiveTintColor: "#2563eb",
      tabBarInactiveTintColor: "#94a3b8",
      tabBarLabelStyle: styles.tabLabel,
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
    [isLandscape, isTablet, width],
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
      <Tabs.Screen name="reports" options={{ href: null }} />
      <Tabs.Screen name="pricing" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    marginLeft: 20,
    padding: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
  },
  headerTitle: { fontWeight: "800", fontSize: 18, color: "#0f172a" },
  tabLabel: { fontWeight: "600", fontSize: 11 },
});
