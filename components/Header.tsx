import { Inter_600SemiBold, useFonts } from '@expo-google-fonts/inter';
import { router } from "expo-router/build/imperative-api";
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  showBackButton = true, 
  onBackPress 
}) => {
  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/logo/MetroWatch.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>MetroWatch</Text>
      </View>
      
      {title && (
        <View style={styles.titleContainer}>
          {showBackButton && (
            <View style={styles.leftSection}>
              <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>{title}</Text>
          </View>
          
          {/* Empty view for balanced layout */}
          <View style={styles.rightSection} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  logo: {
    width: 30,
    height: 30,
    borderRadius: 10,
    marginRight: 10,
  },
  logoText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: '#1A237E',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
    position: 'relative',
  },
  leftSection: {
    width: 40,
    zIndex: 1,
  },
  rightSection: {
    width: 40,
  },
  titleWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 20,
    color: '#1A237E',
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    color: '#000000',
    textAlign: 'center',
  },
});

export default Header;
