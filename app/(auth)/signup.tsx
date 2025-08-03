import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TextInput } from 'react-native-gesture-handler';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = () => {
    // In a real app, you would validate and create account here
    // For now, just navigate to the main app
    router.replace('/(tabs)');
  };

  return (
    <LinearGradient
      colors={['#1a2a6c', '#b21f1f', '#fdbb2d']}
      style={styles.container}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Image 
          source={require('@/assets/images/icon.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
        
        <ThemedText type="title" style={styles.title}>Create Account</ThemedText>
        <ThemedText style={styles.subtitle}>Join AI Interview Prep today</ThemedText>
        
        <BlurView intensity={30} style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          
          <TouchableOpacity style={styles.button} onPress={handleSignup}>
            <ThemedText style={styles.buttonText}>Sign Up</ThemedText>
          </TouchableOpacity>
          
          <ThemedView style={styles.footer}>
            <ThemedText style={styles.footerText}>Already have an account? </ThemedText>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <ThemedText style={styles.linkText}>Login</ThemedText>
              </TouchableOpacity>
            </Link>
          </ThemedView>
        </BlurView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
  },
  formContainer: {
    width: '85%',
    borderRadius: 20,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    color: 'white',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  button: {
    backgroundColor: '#0a7ea4',
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: 'transparent',
  },
  footerText: {
    color: 'rgba(255,255,255,0.8)',
  },
  linkText: {
    color: 'white',
    fontWeight: 'bold',
  },
});