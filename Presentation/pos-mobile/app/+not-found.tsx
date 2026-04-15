import { Link, Stack } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!", headerShown: true }} />

      <View className="flex-1 items-center justify-center bg-slate-50 p-6">
        <Text className="text-2xl font-black text-slate-900 tracking-tighter">
          404
        </Text>

        <Text className="text-base font-bold text-slate-500 mt-2 text-center">
          This screen doesn't exist.
        </Text>

        <Link
          href="/"
          className="mt-8 bg-blue-600 px-8 py-4 rounded-2xl shadow-sm"
        >
          <Text className="text-sm font-black text-white uppercase tracking-widest">
            Go to home screen
          </Text>
        </Link>
      </View>
    </>
  );
}
