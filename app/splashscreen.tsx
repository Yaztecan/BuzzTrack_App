import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

/**
 * A simple UI for your loading splash screen.
 * No navigation or login checks here — just a display.
 */
export default function Splashscreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>BuzzTrack</Text>
      <ActivityIndicator size="large" color="#fff" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5A124',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  loader: {
    marginTop: 16,
  },
});
