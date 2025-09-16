import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Direct string assignment for reliability
const supabaseUrl = 'https://zhdvmejbtbzumzravkpe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZHZtZWpidGJ6dW16cmF2a3BlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MjE4NzgsImV4cCI6MjA3MjI5Nzg3OH0.RfAWV0_xZdxunr2nIB6-vdqVI0c8I1Phn2dK29PSI78';

export class SupabaseService {
  private static instance: SupabaseService;
  private supabase;
  
  private constructor() {
    console.log('Initializing Supabase with URL:', supabaseUrl);
    console.log('Anon key length:', supabaseAnonKey.length);
    
    this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }
  
  public async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  }

  public async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  }
  
  public async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  public async getCurrentUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }
  
  public async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }
  
  public getSupabase() {
    return this.supabase;
  }
}