/**
 * Root Layout — Font loading, splash hold, and stack navigation
 */
import { useEffect, useRef } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from '@/hooks/useFonts';
import { theme } from '@/theme/colors';
import { AppState, AppStateStatus, useColorScheme } from 'react-native';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { fontsLoaded, fontError } = useFonts();
  const appState = useRef(AppState.currentState);
  const backgroundTimeRef = useRef<number | null>(null);
  const colorScheme = useColorScheme(); // Listen for color scheme changes to trigger re-renders

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground
        if (backgroundTimeRef.current) {
          const elapsedMs = Date.now() - backgroundTimeRef.current;
          // Threshold of 2 minutes (120,000 milliseconds)
          const thresholdMs = 2 * 60 * 1000;
          if (elapsedMs >= thresholdMs) {
            router.replace('/splash');
          }
        }
        backgroundTimeRef.current = null;
      } else if (nextAppState === 'background') {
        // App went to background
        backgroundTimeRef.current = Date.now();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <StatusBar style={theme.statusBar} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="splash" options={{ animation: 'none' }} />
        <Stack.Screen name="permissions" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
        <Stack.Screen
          name="summary"
          options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
        />
        <Stack.Screen name="drive-details" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </>
  );
}
