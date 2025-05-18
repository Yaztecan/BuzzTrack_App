import React, { useEffect, useState } from 'react';
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../firebase/firebase'; // Adjust path as necessary

export default function IndexScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for 2 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);

      // Check if a user is already logged in
      if (auth.currentUser) {
        // If yes, navigate to tabs.tsx (which contains the bottom navigation)
        router.replace('/tabs');
      } else {
        // Otherwise, go to login.tsx
        router.replace('/login');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // While loading is true, show splash UI
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Image source={require('../assets/images/logo_with_text.png')} style={styles.logo} resizeMode="contain" />
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // Once the redirect happens, this screen is replaced
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5A124',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 250,
    height: 100,
    marginBottom: 20,
  },
});
