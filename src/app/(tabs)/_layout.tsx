/**
 * Tab Navigator Layout — Bottom navigation with 3 tabs
 */
import { FontFamily } from '@/theme/fonts';
import { theme } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';

function TabIcon({ icon, label, focused }: { icon: keyof typeof Ionicons.glyphMap; label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Ionicons
        name={icon}
        size={24}
        color={focused ? theme.primary : theme.textMuted}
      />
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={focused ? 'home' : 'home-outline'} label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="drive"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={focused ? 'car-sport' : 'car-sport-outline'} label="Drive" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={focused ? 'time' : 'time-outline'} label="History" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.tabBar,
    borderTopWidth: 1,
    borderTopColor: theme.tabBarBorder,
    height: 72,
    paddingTop: 8,
    paddingBottom: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    width: 80,
  },
  tabLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: theme.textMuted,
    marginTop: 4,
  },
  tabLabelActive: {
    color: theme.primary,
  },
});
