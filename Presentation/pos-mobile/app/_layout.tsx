import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { Slot } from "expo-router";
import { Drawer } from "expo-router/drawer";
import {
  BarChart3,
  LogOut,
  Settings,
  Store,
  Tag,
  User,
} from "lucide-react-native";
import React, { memo, useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { NavigationBridge, setDrawerNavigation } from "../src/utils/drawerRef";

const SectionHeader = memo(({ title }: { title: string }) => (
  <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-3 px-2">
    {title}
  </Text>
));
SectionHeader.displayName = "SectionHeader";

const DrawerItem = memo(
  ({
    icon,
    label,
    onPress,
  }: {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center p-4 rounded-2xl active:bg-slate-100"
    >
      {icon}
      <Text className="ml-3 font-bold text-slate-700">{label}</Text>
    </TouchableOpacity>
  ),
);
DrawerItem.displayName = "DrawerItem";

function CustomDrawerContent(
  props: DrawerContentComponentProps,
): React.JSX.Element {
  const { logout } = useAuth();

  useEffect(() => {
    const bridge: NavigationBridge = {
      dispatch: props.navigation.dispatch,
      navigate: (name, params) => props.navigation.navigate(name, params),
      closeDrawer: props.navigation.closeDrawer,
    };

    setDrawerNavigation(bridge);
    return () => setDrawerNavigation(null);
  }, [props.navigation]);

  const handleLogout = useCallback(async (): Promise<void> => {
    try {
      await logout();
    } catch {
      // Empty catch to handle "error is defined but never used"
    }
  }, [logout]);

  const navigateTo = useCallback(
    (path: string): void => {
      props.navigation.closeDrawer();
      const screen = path.split("/").pop();
      if (screen) {
        (props.navigation as unknown as NavigationBridge).navigate("(tabs)", {
          screen,
        });
      }
    },
    [props.navigation],
  );

  return (
    <View style={styles.flexOne}>
      <ScrollView
        contentContainerStyle={styles.drawerScroll}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center gap-3 mb-8 px-2">
          <View className="bg-blue-600 p-2 rounded-xl shadow-sm">
            <Store color="white" size={24} />
          </View>
          <Text className="text-xl font-bold text-slate-900 tracking-tight">
            BizFlow
          </Text>
        </View>

        <SectionHeader title="Management" />
        <View className="gap-y-1 mb-8">
          <DrawerItem
            icon={<BarChart3 size={20} color="#64748b" />}
            label="Analytics"
            onPress={() => navigateTo("/(tabs)/reports")}
          />
          <DrawerItem
            icon={<Tag size={20} color="#64748b" />}
            label="Special Pricing"
            onPress={() => navigateTo("/(tabs)/pricing")}
          />
        </View>

        <SectionHeader title="Account" />
        <View className="gap-y-1">
          <DrawerItem
            icon={<User size={20} color="#64748b" />}
            label="Profile"
            onPress={() => {}}
          />
          <DrawerItem
            icon={<Settings size={20} color="#64748b" />}
            label="Settings"
            onPress={() => {}}
          />
        </View>

        <View className="mt-auto pt-6 border-t border-slate-100">
          <TouchableOpacity
            onPress={() => void handleLogout()}
            className="flex-row items-center p-4 rounded-2xl bg-rose-50 active:bg-rose-100"
          >
            <LogOut size={20} color="#e11d48" />
            <Text className="ml-3 font-bold text-rose-600">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function RootLayoutNav(): React.JSX.Element {
  const { token, isLoading } = useAuth();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flexOne}>
      {!token ? (
        <Slot />
      ) : (
        <Drawer
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={{
            headerShown: false,
            drawerType: "front",
            drawerStyle: { width: isLargeScreen ? 300 : "80%" },
            overlayColor: "rgba(0, 0, 0, 0.4)",
          }}
        >
          <Drawer.Screen name="(tabs)" options={{ drawerLabel: "Home" }} />
        </Drawer>
      )}
    </GestureHandlerRootView>
  );
}

export default function RootLayout(): React.JSX.Element {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  flexOne: { flex: 1, backgroundColor: "white" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  drawerScroll: {
    flexGrow: 1,
    paddingBottom: 40,
    paddingTop: 60,
    paddingHorizontal: 16,
  },
});
