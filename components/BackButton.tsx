import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from './ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type BackButtonProps = {
  onPress?: () => void;
};

export function BackButton({ onPress }: BackButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const handlePress = () => {
    // Provide haptic feedback for better touch experience
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (onPress) {
      onPress();
    } else {
      // Default behavior is to go back
      router.back();
    }
  };

  return (
    <TouchableOpacity 
      style={styles.backButton}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <IconSymbol 
        name="chevron.left" 
        size={24} 
        color={colors.primary} 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});