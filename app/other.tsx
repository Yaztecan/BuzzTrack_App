import React from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../firebase/firebase';
import { useRouter } from 'expo-router';

interface OptionItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress?: () => void;
}

function OptionItem({ icon, label, subtitle, onPress }: OptionItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.optionCard,
        pressed && styles.optionCardPressed,
      ]}
    >
      <Ionicons name={icon} size={22} color="#5c3d2b" style={styles.optionIcon} />
      <View style={styles.optionTextContainer}>
        <Text style={styles.optionText}>{label}</Text>
        {subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
      </View>
    </Pressable>
  );
}

export default function OtherScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.replace('/login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
      {/* Top Profile Section */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/logo.png')} // Adjust if needed
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.emailText}>
          {auth.currentUser?.email || 'test@gmail.com'}
        </Text>
      </View>

      {/* Option Cards */}
      <View style={{ marginHorizontal: 22, marginBottom: 20 }}>
        <OptionItem icon="person-outline" label="Account" onPress={() => console.log('Account')} />
        <OptionItem icon="settings-outline" label="Settings" onPress={() => console.log('Settings')} />
        <OptionItem icon="help-circle-outline" label="Support" onPress={() => console.log('Support')} />
        <OptionItem icon="card-outline" label="Subscription" onPress={() => console.log('Subscription')} />
        <OptionItem icon="globe-outline" label="Website" subtitle="buzztrack.com" onPress={() => console.log('Website')} />
        <OptionItem icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => console.log('Privacy')} />

        {/* Sign-out button (centered, color #896F67) */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutCard,
            pressed && styles.optionCardPressed,
          ]}
        >
          <Ionicons name="log-out-outline" size={22} color="#896F67" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Logout </Text>
        </Pressable>
      </View>

      {/* App Version at the bottom */}
      <Text style={styles.versionText}>App version: 0.1.1</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: '#F5A124',
  },
  // Top profile info
  logoContainer: {
    alignItems: 'center',
    marginTop: 100,
    marginBottom: 30,
  },
  logo: {
    width: 130,
    height: 130,
  },
  emailText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5c3d2b',
    marginTop: 8,
    marginBottom: 10,
  },
  // Individual option card
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5CB24',
    borderRadius: 16,
    marginBottom: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginHorizontal: 15,

    // Shadow
    shadowColor: '#333',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  // Slightly darker color on press
  optionCardPressed: {
    backgroundColor: '#F2C121', // A bit darker than #F5CB24
  },
  // Icon and text styling
  optionIcon: {
    marginRight: 15,
  },
  optionTextContainer: {
    flexShrink: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#5c3d2b',
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#8A8A8A',
  },
  // Logout style
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginHorizontal: 100,
    justifyContent: 'center',
    backgroundColor: '#896F67',

    shadowColor: '#333',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  logoutIcon: {
    marginRight: 0,
    color: '#F5CB24',
  },
  logoutText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#F5CB24',
  },
  // Version text at bottom
  versionText: {
    textAlign: 'center',
    color: '#5c3d2b',
    fontSize: 12,
    marginTop: 0,
    marginBottom: 20,
  },
});
