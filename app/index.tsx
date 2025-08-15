import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { router } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useCallback } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";

SplashScreen.preventAutoHideAsync();

export default function Index() {

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <ImageBackground
        source={require('../assets/images/bg/Landing.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.content}>
          <Text style={styles.title}>MetroWatch</Text>
          <View style={styles.taglineContainer}>
            <Text style={styles.tagline}>Every watch counts.</Text>
            <Text style={styles.tagline}>Every report matters.</Text>
          </View>
          <View style={styles.buttonContainer}>
            <Pressable
              style={styles.button}
              onPress={() => router.push('/Auth/LoginScreen')}
            >
              <Text style={styles.buttonText}>Log in</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.registerButton]}
              onPress={() => router.push('/Auth/RegisterScreen')}
            >
              <Text style={styles.buttonText}>Register</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: '100%',
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 52,
    color: '#1A237E',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  taglineContainer: {
    marginBottom: 64,
  },
  tagline: {
    fontFamily: 'Inter_400SemiBold',
    fontSize: 28,
    color: '#1A237E',
    lineHeight: 40,
    letterSpacing: 0.25,
  },
  buttonContainer: {
    width: '100%',
    gap: 20,
  },
  button: {
    backgroundColor: '#1A237E',
    borderRadius: 12,
    padding: 18,
    width: '100%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  registerButton: {
    backgroundColor: '#1A237E',
  },
  buttonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
