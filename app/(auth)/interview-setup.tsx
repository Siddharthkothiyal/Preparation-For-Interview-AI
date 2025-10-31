import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function InterviewSetup() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string; plan?: string }>();
  const role = params.role ?? 'frontend';
  const plan = params.plan ?? 'free';

  const [duration, setDuration] = useState(params.role ? '15' : '15');

  const start = () => {
    const dur = parseInt(duration || '15', 10);
    if (isNaN(dur) || dur <= 0) {
      Alert.alert('Invalid duration', 'Enter a valid number of minutes.');
      return;
    }
    // navigate to interview (tabs) screen
    router.push(`/(tabs)/interview?role=${encodeURIComponent(role)}&duration=${encodeURIComponent(String(dur))}&plan=${encodeURIComponent(plan)}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Interview Setup</Text>
      <Text style={styles.subtitle}>Role: {role} — Plan: {plan}</Text>

      <Text style={styles.label}>Duration (minutes)</Text>
      <TextInput
        value={duration}
        onChangeText={setDuration}
        keyboardType="numeric"
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={start}>
        <Text style={styles.buttonText}>Start Interview</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#0b1220' },
  title: { fontSize: 22, color: '#fff', marginBottom: 6 },
  subtitle: { color: 'rgba(255,255,255,0.8)', marginBottom: 12 },
  label: { color: 'rgba(255,255,255,0.8)', marginBottom: 6 },
  input: { backgroundColor: '#111827', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 12 },
  button: { backgroundColor: '#0a7ea4', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
});