// ✅ Polyfills required for Supabase to work in React Native
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Replace with your actual Supabase credentials or read from env
const SUPABASE_URL = 'https://zhdvmejbtbzumzravkpe.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZHZtZWpidGJ6dW16cmF2a3BlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MjE4NzgsImV4cCI6MjA3MjI5Nzg3OH0.RfAWV0_xZdxunr2nIB6-vdqVI0c8I1Phn2dK29PSI78';

export default class SupabaseService {
  private static instance: SupabaseService;
  private supabase: SupabaseClient | null = null;
  private lastFeedback: any = null;

  private constructor() {
    try {
      // create client; in React Native environment, default fetch works in Expo
      this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          // use AsyncStorage for session persistence
          storage: AsyncStorage as any,
        },
      });
    } catch (error: any) {
      console.warn('Supabase init error', error);
      this.supabase = null;
    }
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  public getSupabase(): SupabaseClient | null {
    return this.supabase;
  }

  // AUTH
  public async signUp(email: string, password: string, name?: string, emailRedirectTo?: string) {
    if (!this.supabase) throw new Error('Supabase not initialized');

    const options: any = { data: { name } };
    if (emailRedirectTo) options.emailRedirectTo = emailRedirectTo;

    const res = await this.supabase.auth.signUp({
      email,
      password,
      options, // includes data and optional emailRedirectTo
    });

    if (res.error) throw res.error;
    return res.data;
  }

  public async signIn(email: string, password: string) {
    if (!this.supabase) throw new Error('Supabase not initialized');
    const res = await this.supabase.auth.signInWithPassword({ email, password });
    if (res.error) throw res.error;
    return res.data;
  }

  public async signOut() {
    if (!this.supabase) throw new Error('Supabase not initialized');
    const res = await this.supabase.auth.signOut();
    if (res.error) throw res.error;
    return res;
  }

  public async getCurrentUser() {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase.auth.getUser();
    if (error) {
      console.warn('getCurrentUser error', error);
      return null;
    }
    return data.user ?? null;
  }

  public async getSession() {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase.auth.getSession();
    if (error) {
      console.warn('getSession error', error);
      return null;
    }
    return data.session ?? null;
  }

  public async resetPassword(email: string) {
    if (!this.supabase) throw new Error('Supabase not initialized');
    const res = await this.supabase.auth.resetPasswordForEmail(email);
    if (res.error) throw res.error;
    return res;
  }

  // USER PROFILE
  public async createUserProfile(userId: string, profileData: any) {
    if (!this.supabase) throw new Error('Supabase not initialized');
    const { error } = await this.supabase.from('user_profiles').upsert({
      user_id: userId,
      ...profileData,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  }

  public async getUserProfile(userId: string) {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase.from('user_profiles').select('*').eq('user_id', userId).single();
    if (error) {
      console.warn('getUserProfile error', error);
      return null;
    }
    return data ?? null;
  }

  // INTERVIEW DATA
  public async saveInterviewData(userId: string | null, interviewData: any) {
    if (!this.supabase) throw new Error('Supabase not initialized');
    // store a copy in DB if user available
    try {
      const payload = {
        user_id: userId,
        ...interviewData,
        created_at: new Date().toISOString(),
      };
      const { error } = await this.supabase.from('interviews').insert(payload);
      if (error) {
        console.warn('saveInterviewData db error', error);
      } else {
        // cache last feedback locally as well
        this.lastFeedback = interviewData.feedback ?? null;
      }
    } catch (e) {
      console.warn('saveInterviewData error', e);
    }
  }

  public async getInterviewHistory(userId: string) {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase.from('interviews').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) {
      console.warn('getInterviewHistory error', error);
      return [];
    }
    return data ?? [];
  }

  // Last feedback cache (in-memory). Useful for passing feedback to Feedback screen.
  public setLastFeedback(fb: any) {
    this.lastFeedback = fb;
  }
  public getLastFeedback() {
    return this.lastFeedback;
  }

  // SUBSCRIPTIONS (simple example)
  public async updateSubscription(userId: string, selectedPlan: string) {
    if (!this.supabase) throw new Error('Supabase not initialized');
    // minimal: upsert field on user_profiles
    const { error } = await this.supabase.from('user_profiles').upsert({ user_id: userId, plan: selectedPlan, updated_at: new Date().toISOString() });
    if (error) throw error;
  }
}

export const supabaseService = SupabaseService.getInstance();
