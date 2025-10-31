import SupabaseService from '@/services/SupabaseService';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PricingScreen() {
  const router = useRouter();
  const supabase = useMemo(() => SupabaseService.getInstance(), []);
  const [loading, setLoading] = useState(false);
  const [plans] = useState([
    { id: 'free', name: 'Free', price: 0, desc: 'Practice with limited questions' },
    { id: 'pro', name: 'Pro', price: 9, desc: 'Unlimited interviews + feedback' },
    { id: 'team', name: 'Team', price: 29, desc: 'Team seats and analytics' },
  ]);

  // optional: verify supabase client is healthy on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const client = supabase.getSupabase();
        if (!client) {
          console.warn('Supabase client missing in PricingScreen');
        }
      } catch (err) {
        console.warn('PricingScreen supabase check failed', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [supabase]);

  const handleSelectPlan = async (planId: string) => {
    setLoading(true);
    try {
      // Navigate directly to the role-selection screen under (auth)
      // so the plan query param is passed along.
      router.push(`/(auth)/role-selection?plan=${encodeURIComponent(planId)}`);
    } catch (error) {
      console.error('Error selecting plan', error);
      Alert.alert('Error', 'Could not start role selection. Check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Pricing</Text>
      <Text style={styles.subtitle}>Pick a plan that fits your needs</Text>

      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color="#0a7ea4" />
        </View>
      )}

      <View style={styles.plans}>
        {plans.map((p) => (
          <View key={p.id} style={styles.planCard}>
            <Text style={styles.planName}>{p.name} {p.price > 0 ? `— $${p.price}/mo` : ''}</Text>
            <Text style={styles.planDesc}>{p.desc}</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => handleSelectPlan(p.id)}
              accessibilityLabel={`Choose ${p.name}`}
            >
              <Text style={styles.selectButtonText}>{p.price === 0 ? 'Get Started' : 'Choose Plan'}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Have issues? Check console logs and run expo start -c to clear Metro cache.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'stretch', backgroundColor: '#0b1220', minHeight: '100%' },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 6 },
  subtitle: { color: 'rgba(255,255,255,0.8)', marginBottom: 18 },
  loading: { marginVertical: 8, alignItems: 'center' },
  plans: { gap: 12 },
  planCard: { backgroundColor: '#111827', padding: 16, borderRadius: 12, marginBottom: 12 },
  planName: { color: '#fff', fontSize: 18, fontWeight: '700' },
  planDesc: { color: 'rgba(255,255,255,0.8)', marginVertical: 8 },
  selectButton: { backgroundColor: '#0a7ea4', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  selectButtonText: { color: '#fff', fontWeight: '700' },
  footer: { marginTop: 18 },
  footerText: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
});