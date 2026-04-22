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
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { drawerNavigationRef } from "../src/utils/drawerRef";

function CustomDrawerContent(
  props: DrawerContentComponentProps,
): React.JSX.Element {
  const { logout } = useAuth();

  drawerNavigationRef.current = props.navigation;

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
    } catch {
      // Unused variable 'e' removed for strict TS compliance
    }
  };

  const navigateTo = (path: string): void => {
    props.navigation.closeDrawer();
    const screen = path.split("/").pop();
    if (screen) {
      props.navigation.navigate("(tabs)", { screen });
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 40,
          paddingTop: 60,
          paddingHorizontal: 16,
        }}
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

const SectionHeader = ({ title }: { title: string }): React.JSX.Element => (
  <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-3 px-2">
    {title}
  </Text>
);

const DrawerItem = ({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}): React.JSX.Element => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center p-4 rounded-2xl active:bg-slate-100"
  >
    {icon}
    <Text className="ml-3 font-bold text-slate-700">{label}</Text>
  </TouchableOpacity>
);

function RootLayoutNav(): React.JSX.Element {
  const { token, isLoading } = useAuth();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  // Pre-emptive server wake-up ping
  useEffect(() => {
    if (token) {
      // This simple fetch pings the root domain to trigger Render wake-up
      // so that the Dashboard fetch has a head start.
      fetch("https://bizflow-ohsr.onrender.com/api/Auth/login", {
        method: "OPTIONS",
      }).catch(() => {
        /* Silent fail is expected on OPTION pings */
      });
    }
  }, [token]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {!token ? (
        <Slot />
      ) : (
        <Drawer
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={{
            headerShown: false,
            drawerType: isLargeScreen ? "permanent" : "front",
            drawerStyle: {
              width: isLargeScreen ? 300 : "80%",
            },
            overlayColor: "rgba(0, 0, 0, 0.4)",
          }}
        >
          <Drawer.Screen
            name="(tabs)"
            options={{
              drawerLabel: "Home",
              swipeEnabled: true,
            }}
          />
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
