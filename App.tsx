import { ExpoRoot } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <ExpoRoot />
    </SafeAreaProvider>
  );
}