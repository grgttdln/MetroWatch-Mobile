import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="Auth/LoginScreen" options={{ headerShown: false }} />
      <Stack.Screen
        name="Auth/RegisterScreen"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Dashboard/SocialLayerScreen"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
