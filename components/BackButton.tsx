import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from './ui/IconSymbol';

type BackButtonProps = {
  onPress?: () => void;
};

export function BackButton({ onPress }: BackButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const iconColor = colorScheme === 'dark' ? '#FFFFFF' : '#111111';
  const scale = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePress = () => {
    // Provide haptic feedback for better touch experience
    Haptics.impactAsync && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
        accessibilityLabel="Back"
      >
        <IconSymbol 
          name="chevron-left" 
          size={28} 
          color={iconColor} 
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});