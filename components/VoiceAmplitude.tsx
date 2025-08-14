import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';

type VoiceAmplitudeProps = {
  isRecording: boolean;
};

export function VoiceAmplitude({ isRecording }: VoiceAmplitudeProps) {
  // Create multiple animated values for different bars
  const amplitudes = Array.from({ length: 7 }, () => useSharedValue(0.3));
  
  useEffect(() => {
    if (isRecording) {
      // Animate each bar with different timing to create a realistic effect
      amplitudes.forEach((amplitude, index) => {
        amplitude.value = withRepeat(
          withTiming(
            Math.random() * 0.7 + 0.3, // Random height between 0.3 and 1.0
            { 
              duration: 700 + Math.random() * 300, // Random duration
              easing: Easing.inOut(Easing.ease)
            }
          ),
          -1, // Infinite repeat
          true // Reverse
        );
      });
    } else {
      // Reset all bars when not recording
      amplitudes.forEach(amplitude => {
        amplitude.value = withTiming(0.3, { duration: 300 });
      });
    }
  }, [isRecording]);

  return (
    <View style={styles.container}>
      {amplitudes.map((amplitude, index) => {
        const animatedStyle = useAnimatedStyle(() => ({
          height: `${amplitude.value * 100}%`,
          opacity: isRecording ? 1 : 0.5,
        }));

        return (
          <Animated.View 
            key={index} 
            style={[styles.bar, animatedStyle]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    width: '80%',
    marginVertical: 10,
  },
  bar: {
    width: 4,
    backgroundColor: '#00E5FF', // Cyan color for the bars
    borderRadius: 2,
  },
});