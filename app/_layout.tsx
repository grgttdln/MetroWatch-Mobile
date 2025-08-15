import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        animation: 'fade',
        animationDuration: 300,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
          animation: 'fade',
        }} 
      />
      <Stack.Screen 
        name="Auth/LoginScreen" 
        options={{ 
          headerShown: false,
          animation: 'fade',
        }} 
      />
      <Stack.Screen
        name="Auth/RegisterScreen"
        options={{ 
          headerShown: false,
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name="Dashboard/SocialLayerScreen"
        options={{ 
          headerShown: false,
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name="Reports/ReportUploadScreen"
        options={{ 
          headerShown: false,
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name="Profile/MyImpactScreen"
        options={{ 
          headerShown: false,
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name="Incentives/IncentiveClaimScreen"
        options={{ 
          headerShown: false,
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name="Incentives/IncentiveCollectionScreen"
        options={{ 
          headerShown: false,
          animation: 'fade',
        }}
      />
    </Stack>
  );
}
