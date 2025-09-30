import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View
      style={styles.container}>
      <Text style={styles.title}>Hola Mundo</Text>
      <Link href="/(auth)/signup" > Sign Up </Link>
      <Link href="/(auth)"> Login</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: "blue" },
});