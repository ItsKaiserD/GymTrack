// app/_layout.jsx
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import { useAuthStore } from "@/store/authStore";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { checkAuth, user, token, isCheckingAuth } = useAuthStore(); // <- usamos isCheckingAuth

  const [fontsLoaded] = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    // Espera a que:
    // 1) cargue fuentes, 2) checkAuth termine, 3) tengamos segments
    if (!fontsLoaded || isCheckingAuth || !segments.length) return;

    const inAuth = segments[0] === "(auth)";
    const signedIn = Boolean(user && token);
    const role = user?.role || "trainer";

    if (!signedIn) {
      if (!inAuth) router.replace("/(auth)");
      return;
    }

    // Con sesión:
    if (role === "admin") {
      if (segments[0] !== "(admin)") router.replace("/(admin)");
    } else {
      // trainer (u otros)
      if (segments[0] !== "(tabs)") router.replace("/(tabs)");
    }
  }, [fontsLoaded, isCheckingAuth, user, token, segments]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeScreen>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            {/* NUEVO: grupo admin */}
            <Stack.Screen name="(admin)" />
            {/* Ya existente: grupo tabs (trainer) */}
            <Stack.Screen name="(tabs)" />
          </Stack>
        </SafeScreen>
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
