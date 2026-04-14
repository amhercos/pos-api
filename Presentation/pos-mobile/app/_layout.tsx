import { router } from "expo-router";
import { Drawer } from "expo-router/drawer";
import * as SecureStore from "expo-secure-store";
import { LogOut, Settings, Store, User } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

// Custom Sidebar Content
function CustomDrawerContent() {
  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("token");
    router.replace("/login");
  };

  return (
    <View className="flex-1 bg-white pt-16 px-4">
      {/* Sidebar Header - BizFlow Branding */}
      <View className="flex-row items-center gap-3 mb-8 px-2">
        <View className="bg-blue-600 p-2 rounded-xl">
          <Store color="white" size={24} />
        </View>
        <Text className="text-xl font-bold text-slate-900">BizFlow</Text>
      </View>

      {/* Navigation Items */}
      <View className="gap-y-2">
        <TouchableOpacity className="flex-row items-center p-4 rounded-xl hover:bg-slate-50">
          <User size={20} color="#64748b" />
          <Text className="ml-3 font-semibold text-slate-700">Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center p-4 rounded-xl hover:bg-slate-50">
          <Settings size={20} color="#64748b" />
          <Text className="ml-3 font-semibold text-slate-700">Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Logout at Bottom */}
      <View className="mt-auto mb-8 border-t border-slate-100 pt-4">
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center p-4 rounded-xl bg-rose-50"
        >
          <LogOut size={20} color="#e11d48" />
          <Text className="ml-3 font-semibold text-rose-600">Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={() => <CustomDrawerContent />}
        screenOptions={{
          headerShown: false, // We let the Tabs or Screens handle the header
          drawerStyle: { width: "75%" },
        }}
      >
        <Drawer.Screen name="(tabs)" options={{ drawerLabel: "Home" }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}
