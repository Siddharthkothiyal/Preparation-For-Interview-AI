// ✅ Polyfills required for Supabase to work in React Native
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ✅ Replace with your actual Supabase credentials
const supabaseUrl = 'https://zhdvmejbtbzumzravkpe.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZHZtZWpidGJ6dW16cmF2a3BlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MjE4NzgsImV4cCI6MjA3MjI5Nzg3OH0.RfAWV0_xZdxunr2nIB6-vdqVI0c8I1Phn2dK29PSI78';

export default class SupabaseService {
  private static instance: SupabaseService;
  private supabase: SupabaseClient;

  private constructor() {
    try {
      console.log('✅ Initializing Supabase client...');
      this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      });
      console.log('✅ Supabase client initialized successfully!');
    } catch (error: any) {
      console.error('❌ Failed to initialize Supabase client:', error.message || error);
      throw error;
    }
  }

  // ✅ Singleton pattern
  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  // ✅ Accessor for the Supabase client
  public getSupabase(): SupabaseClient {
    return this.supabase;
  }

  // ======================
  // 🔐 AUTH FUNCTIONS
  // ======================

  public async signUp(email: string, password: string) {
  try {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      // optional metadata:
      options: {
        data: { created_at: new Date().toISOString() }, // ✅ this must be an object, not string
      },
    });

    if (error) throw error;
    console.log('✅ Sign up successful:', data);
    return { data, error: null };
  } catch (error: any) {
    console.error('❌ Sign up error:', error.message);
    return { data: null, error };
  }
}

  public async signIn(email: string, password: string) {
  try {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Please verify your email before logging in.');
      }
      throw error;
    }

    console.log('✅ Sign in successful:', data);
    return { data, error: null };
  } catch (error: any) {
    console.error('❌ Sign-in error:', error.message);
    return { data: null, error };
  }
}

  public async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error('❌ Sign-out error:', error.message || error);
      throw error;
    }
  }

  public async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  public async getSession() {
    const { data, error } = await this.supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  public async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  // ======================
  // 👤 USER PROFILE FUNCTIONS
  // ======================

  public async createUserProfile(userId: string, profileData: any) {
    const { error } = await this.supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        ...profileData,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  }

  public async getUserProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  // ======================
  // 🧠 INTERVIEW DATA
  // ======================

  public async saveInterviewData(userId: string, interviewData: any) {
    const { error } = await this.supabase
      .from('interviews')
      .insert({
        user_id: userId,
        ...interviewData,
        created_at: new Date().toISOString(),
      });

    if (error) throw error;
  }

  public async getInterviewHistory(userId: string) {
    const { data, error } = await this.supabase
      .from('interviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // ======================
  // 💳 SUBSCRIPTION MANAGEMENT
  // ======================

  public async updateSubscription(userId: string, selectedPlan: string) {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan: selectedPlan,
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;
    return data;
  }
}

// ✅ Export Singleton Instance
export const supabaseService = SupabaseService.getInstance();
