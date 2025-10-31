import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import SupabaseService from '@/services/SupabaseService';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const router = useRouter();
  const supabaseService = useMemo(() => SupabaseService.getInstance(), []);

  // ✅ Check for existing active session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = supabaseService.getSupabase();
        const { data, error } = await supabase.auth.getSession();
        if (error) console.warn('Session check error:', error.message);

        if (data.session) {
          console.log('✅ Active session found, redirecting...');
          router.replace('/pricing');
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        setInitializing(false);
      }
    };

    checkSession();
  }, []);

  // ✅ Handle login
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await supabaseService.signIn(email, password);
      Alert.alert('Success', 'Welcome back!');
      router.replace('/pricing');
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Failed',
        error.message || 'Please check your credentials and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Go to signup
  const handleSignUp = () => router.push('/(auth)/signup');

  if (initializing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#000000', '#121212']} style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Interview Prep
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Practice your interview skills with AI
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.forgotPassword}>
          <ThemedText style={styles.forgotPasswordText}>Forgot Password?</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginButton, isLoading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.buttonText}>Login</ThemedText>
          )}
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <ThemedText style={styles.signupText}>Don't have an account? </ThemedText>
          <TouchableOpacity onPress={handleSignUp}>
            <ThemedText style={styles.signupLink}>Sign Up</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 100,
    marginBottom: 50,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'transparent',
    padding: 20,
  },
  input: {
    height: 55,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    color: 'white',
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#0a7ea4',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#0a7ea4',
    height: 55,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    color: 'rgba(255,255,255,0.7)',
  },
  signupLink: {
    color: '#0a7ea4',
    fontWeight: 'bold',
  },
});
