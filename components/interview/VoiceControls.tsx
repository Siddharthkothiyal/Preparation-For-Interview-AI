import React from 'react';
import { StyleSheet, View, Animated, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '../ThemedText';
import { IconSymbol } from '../ui/IconSymbol';
import { VoiceAmplitude } from '../VoiceAmplitude';

interface VoiceControlsProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  pulseAnim: Animated.Value;
  volumeLevel?: number;
}

export function VoiceControls({ 
  isRecording, 
  onToggleRecording, 
  pulseAnim,
  volumeLevel = 0
}: VoiceControlsProps) {
  const handlePress = () => {
    if (!isRecording) {
      // Start recording
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      // Stop recording and send response
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onToggleRecording();
  };

  return (
    <View style={styles.container}>
      {isRecording && <VoiceAmplitude isRecording={isRecording} />}
      
      <Animated.View style={{
        transform: [{ scale: pulseAnim }],
        opacity: isRecording ? 0.8 : 1
      }}>
        <TouchableOpacity 
          style={[styles.micButton, isRecording && styles.micButtonRecording]} 
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <IconSymbol name="mic.fill" size={30} color="white" />
        </TouchableOpacity>
      </Animated.View>
      <ThemedText style={styles.recordingText}>
        {isRecording ? "Tap to send" : "Tap to record"}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 10,
  },
  micButton: {
    backgroundColor: '#00E5FF',
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  micButtonRecording: {
    backgroundColor: '#FF3D71',
  },
  recordingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 14,
  },
});