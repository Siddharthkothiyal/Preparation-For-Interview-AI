import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

const { width } = Dimensions.get('window');
const START_INTERVIEW_PATH = '/(tabs)/interview';

type Role = {
  id: string;
  title: string;
  desc: string;
  duration: string;
  icon: string;
  group?: 'Tech' | 'HR' | 'Internship' | 'Senior';
};

const rolesData: Role[] = [
  // Senior roles
  { id: 'sde1', title: 'SDE I', desc: 'Entry-level software engineer', duration: '15', icon: 'person', group: 'Senior' },
  { id: 'sde2', title: 'SDE II', desc: 'Mid-level software engineer', duration: '25', icon: 'person', group: 'Senior' },
  { id: 'sde3', title: 'SDE III', desc: 'Senior engineer / tech lead', duration: '35', icon: 'person', group: 'Senior' },

  // Tech roles
  { id: 'frontend', title: 'Frontend Developer', desc: 'HTML, CSS, React, UI/UX', duration: '10', icon: 'code-slash', group: 'Tech' },
  { id: 'backend', title: 'Backend Developer', desc: 'APIs, Databases, Node.js', duration: '15', icon: 'server', group: 'Tech' },
  { id: 'fullstack', title: 'Fullstack Developer', desc: 'Frontend + Backend + DevOps basics', duration: '20', icon: 'layers', group: 'Tech' },
  { id: 'devops', title: 'DevOps Engineer', desc: 'CI/CD, infra, containers', duration: '12', icon: 'options', group: 'Tech' },
  { id: 'datasci', title: 'Data Scientist', desc: 'ML, statistics, Python', duration: '15', icon: 'analytics', group: 'Tech' },

  // HR roles
  { id: 'hr_recruiter', title: 'HR Recruiter', desc: 'Screening, behavioral questions', duration: '8', icon: 'people', group: 'HR' },
  { id: 'hr_manager', title: 'HR Manager', desc: 'Leadership & culture fit', duration: '10', icon: 'people', group: 'HR' },

  // Internship roles
  { id: 'intern_software', title: 'Software Intern', desc: 'Basics, problem solving', duration: '7', icon: 'school', group: 'Internship' },
  { id: 'intern_data', title: 'Data Intern', desc: 'SQL, EDA basics', duration: '7', icon: 'document-text', group: 'Internship' },
];

export default function RoleSelection() {
  const router = useRouter();
  const params = useLocalSearchParams<{ plan?: string }>();
  const plan = params.plan ?? 'free';

  const chooseRole = (roleId: string) => {
    // go to interview setup first (allow user to tweak duration)
    router.push(`/(auth)/interview-setup?role=${encodeURIComponent(roleId)}&plan=${encodeURIComponent(plan)}`);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
      <Text style={{ fontSize: 22, color: '#fff', marginBottom: 10 }}>Choose role</Text>
      {rolesData.map(r => (
        <TouchableOpacity key={r.id} style={styles.card} onPress={() => chooseRole(r.id)}>
          <Text style={styles.cardTitle}>{r.title}</Text>
          <Text style={styles.cardDesc}>{r.desc}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const CARD_WIDTH = Math.min(420, width - 48);
const styles = StyleSheet.create({
  card: { backgroundColor: '#111827', padding: 16, borderRadius: 12, marginBottom: 12 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cardDesc: { color: 'rgba(255,255,255,0.8)', marginTop: 6 },
});
