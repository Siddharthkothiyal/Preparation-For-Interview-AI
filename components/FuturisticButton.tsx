import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from './ThemedText';

type FuturisticButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
};

export function FuturisticButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
  disabled = false,
}: FuturisticButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  // Define gradient colors based on variant
  const getGradientColors = () => {
    if (disabled) return ['rgba(150,150,150,0.3)', 'rgba(100,100,100,0.3)'];
    
    switch (variant) {
      case 'primary':
        return ['#00E5FF', '#0077FF'];
      case 'secondary':
        return ['#7B42F6', '#B01EFF'];
      case 'danger':
        return ['#FF3D71', '#FF1B5E'];
      default:
        return ['#00E5FF', '#0077FF'];
    }
  };
  
  // Define button height based on size
  const getButtonHeight = () => {
    switch (size) {
      case 'small': return 40;
      case 'medium': return 50;
      case 'large': return 60;
      default: return 50;
    }
  };
  
  // Define text size based on button size
  const getTextSize = () => {
    switch (size) {
      case 'small': return 14;
      case 'medium': return 16;
      case 'large': return 18;
      default: return 16;
    }
  };
  
  const handlePress = () => {
    if (disabled) return;
    
    // Provide haptic feedback based on variant
    switch (variant) {
      case 'primary':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'secondary':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'danger':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    onPress();
  };

  return (
    <TouchableOpacity
      style={[styles.button, { height: getButtonHeight() }, style]}
      onPress={handlePress}
      activeOpacity={disabled ? 1 : 0.8}
      disabled={disabled}
    >
      <LinearGradient
        colors={getGradientColors() as unknown as readonly [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <ThemedText 
          style={[
            styles.text, 
            { fontSize: getTextSize() },
            disabled && styles.disabledText,
            textStyle
          ]}
        >
          {title}
        </ThemedText>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  disabledText: {
    color: 'rgba(255,255,255,0.5)',
  },
});