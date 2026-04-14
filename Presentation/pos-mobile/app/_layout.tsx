import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { Href, useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import * as SecureStore from "expo-secure-store";
import {
  BarChart3,
  LogOut,
  Settings,
  Store,
  Tag,
  User,
} from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync("token");
      router.replace("/login" as Href);
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  const navigateTo = (path: string) => {
    props.navigation.closeDrawer();
    router.push(path as Href);
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

        <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-3 px-2">
          Management
        </Text>
        <View className="gap-y-1 mb-8">
          <TouchableOpacity
            onPress={() => navigateTo("/(tabs)/reports")}
            className="flex-row items-center p-4 rounded-2xl active:bg-slate-100"
          >
            <BarChart3 size={20} color="#64748b" />
            <Text className="ml-3 font-bold text-slate-700">Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigateTo("/pricing")}
            className="flex-row items-center p-4 rounded-2xl active:bg-slate-100"
          >
            <Tag size={20} color="#64748b" />
            <Text className="ml-3 font-bold text-slate-700">
              Special Pricing
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-3 px-2">
          Account
        </Text>
        <View className="gap-y-1">
          <TouchableOpacity className="flex-row items-center p-4 rounded-2xl active:bg-slate-100">
            <User size={20} color="#64748b" />
            <Text className="ml-3 font-bold text-slate-700">Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center p-4 rounded-2xl active:bg-slate-100">
            <Settings size={20} color="#64748b" />
            <Text className="ml-3 font-bold text-slate-700">Settings</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-auto pt-6 border-t border-slate-100">
          <TouchableOpacity
            onPress={handleLogout}
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

export default function RootLayout() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        // defaultStatus is a top-level prop of Drawer, not inside screenOptions
        defaultStatus="closed"
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          // 'front' ensures the drawer is an overlay that can be dismissed
          drawerType: "front",
          drawerStyle: {
            width: isTablet ? 320 : "75%",
            borderRightWidth: 1,
            borderRightColor: "#f1f5f9",
          },
          overlayColor: "rgba(15, 23, 42, 0.5)",
          swipeEnabled: true,
        }}
      >
        <Drawer.Screen name="(tabs)" options={{ title: "Home" }} />
        <Drawer.Screen name="pricing" options={{ title: "Pricing" }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}
