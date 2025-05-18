import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

// Screens
import HivesScreen from './hives';
import NotesScreen from './notes';
import OtherScreen from './other';

const Tab = createBottomTabNavigator();

export default function TabsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const iconName: keyof typeof Ionicons.glyphMap =
          route.name === 'Hives' ? 'beaker' :
          route.name === 'Journal' ? 'book' :
          route.name === 'Other' ? 'menu' :
          'help';

        return {
          // Hide the top bar
          headerShown: false,

          // Icon
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={iconName} size={size} color={color} />
          ),

          // Colors
          tabBarActiveTintColor: '#F5CB24',   // Light gray/white for active
          tabBarInactiveTintColor: '#D9D9D9',    // Slightly darker gray for inactive

          // Tab bar style
          tabBarStyle: {
            backgroundColor: '#5C3D2B',
            height: Platform.OS === 'web' ? 80 : 60 + insets.bottom,
            paddingBottom: Platform.OS === 'web' ? 5 : Math.max(insets.bottom, 10),
            paddingTop: 10,
          },

          // Label style
          tabBarLabelStyle: {
            fontSize: 14,
            marginBottom: 0,
          },
        };
      }}
    >
      <Tab.Screen name="Hives" component={HivesScreen} />
      <Tab.Screen name="Journal" component={NotesScreen} />
      <Tab.Screen name="Other" component={OtherScreen} />
    </Tab.Navigator>
  );
}
