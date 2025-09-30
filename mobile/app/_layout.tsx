import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeScreen>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index"></Stack.Screen>
            <Stack.Screen name="(auth)"></Stack.Screen>
          </Stack>
        </SafeScreen>
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
