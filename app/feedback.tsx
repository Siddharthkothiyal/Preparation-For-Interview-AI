import SupabaseService from '@/services/SupabaseService';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function FeedbackScreen() {
  const service = SupabaseService.getInstance();
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Prefer in-memory cached feedback (set when interview ends)
        const cached = service.getLastFeedback();
        if (cached) {
          if (mounted) setFeedback(cached);
          return;
        }

        // Fallback: get last saved interview for current user
        const user = await service.getCurrentUser();
        if (!user) {
          // no signed-in user - nothing to show
          if (mounted) setFeedback(null);
          return;
        }
        const history = await service.getInterviewHistory(user.id);
        if (history && history.length > 0 && mounted) {
          setFeedback(history[0].feedback ?? history[0]);
        }
      } catch (e) {
        console.warn('Feedback load error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;

  if (!feedback) return <View style={styles.center}><Text style={styles.empty}>No feedback available yet.</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Interview Feedback</Text>
      <Text style={styles.sectionTitle}>Summary</Text>
      <Text style={styles.text}>{feedback.summary ?? feedback.feedback ?? '—'}</Text>

      <Text style={styles.sectionTitle}>Strengths</Text>
      <Text style={styles.text}>{feedback.strengths ?? '—'}</Text>

      <Text style={styles.sectionTitle}>Areas to Improve</Text>
      <Text style={styles.text}>{feedback.areasToImprove ?? '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#0b1220', minHeight: '100%' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 12 },
  sectionTitle: { color: 'rgba(255,255,255,0.9)', marginTop: 10, fontWeight: '600' },
  text: { color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  empty: { color: 'rgba(255,255,255,0.7)' },
});