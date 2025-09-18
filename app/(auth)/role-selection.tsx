import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { ProfileButton } from '@/components/ProfileButton';

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
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const grouped = useMemo(() => {
    return rolesData.reduce((acc: Record<string, Role[]>, r) => {
      (acc[r.group || 'Other'] ||= []).push(r);
      return acc;
    }, {});
  }, []);

  const onStart = () => {
    if (!selectedRole) return;
    try {
      router.push({ pathname: START_INTERVIEW_PATH, params: { role: selectedRole } } as any);
    } catch {
      /* ignore */
    }
  };

  return (
    <LinearGradient colors={['#06121a', '#081826']} style={styles.container}>
      <ProfileButton />
      
      <View style={styles.top}>
        <Text style={styles.pageTitle}>Choose Role</Text>
        <Text style={styles.pageSubtitle}>Pick a role to start a focused AI mock interview</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {Object.keys(grouped).map(groupName => (
          <View key={groupName} style={styles.group}>
            <Text style={styles.groupTitle}>{groupName}</Text>
            <View style={styles.row}>
              {grouped[groupName].map(role => {
                const isSelected = selectedRole === role.id;
                const isHovered = hovered === role.id;
                return (
                  <Pressable
                    key={role.id}
                    onPress={() => setSelectedRole(role.id)}
                    onHoverIn={() => Platform.OS === 'web' && setHovered(role.id)}
                    onHoverOut={() => Platform.OS === 'web' && setHovered(null)}
                    onPressIn={() => Platform.OS !== 'web' && setHovered(role.id)}
                    onPressOut={() => Platform.OS !== 'web' && setHovered(null)}
                    style={({ pressed }) => [
                      styles.cardWrapper,
                      isSelected && styles.cardSelected,
                      pressed && styles.cardPressed,
                      isHovered && styles.cardHover
                    ]}
                  >
                    <View style={styles.card}>
                      <View style={[styles.iconWrap, isSelected && styles.iconWrapSelected]}>
                        <Ionicons
                          name={role.icon as any}
                          size={24}
                          color={isSelected ? '#06121a' : 'white'}
                        />
                      </View>
                      <View style={styles.roleInfo}>
                        <Text style={styles.roleTitle}>{role.title}</Text>
                        <Text style={styles.roleDesc}>{role.desc}</Text>
                        <View style={styles.meta}>
                          <Ionicons name="time" size={12} color="rgba(255,255,255,0.7)" />
                          <Text style={styles.metaText}>{role.duration} min</Text>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.startButton, !selectedRole && styles.startButtonDisabled]}
          onPress={onStart}
          disabled={!selectedRole}
        >
          <LinearGradient
            colors={selectedRole ? ['#06b6d4', '#0891b2'] : ['#374151', '#4b5563']}
            style={styles.startGradient}
          >
            <Text style={[styles.startText, !selectedRole && styles.startTextDisabled]}>
              Start Interview
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const CARD_WIDTH = Math.min(420, width - 48);

const styles = StyleSheet.create({
  container: { flex: 1 },
  top: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 8 },
  pageTitle: { color: 'white', fontSize: 28, fontWeight: '800' },
  pageSubtitle: { color: 'rgba(255,255,255,0.7)', marginTop: 6 },

  scroll: { padding: 20, paddingBottom: 120 },
  group: { marginBottom: 18 },
  groupTitle: { color: '#bdefff', fontSize: 16, fontWeight: '800', marginBottom: 12 },

  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },

  cardWrapper: {
    width: CARD_WIDTH,
    marginBottom: 12,
    borderRadius: 14,
    overflow: 'hidden',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  cardHover: {
    transform: [{ scale: 1.02 }],
    backgroundColor: 'rgba(6,182,212,0.04)',
    borderColor: 'rgba(6,182,212,0.14)',
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  cardSelected: {
    backgroundColor: 'rgba(6,182,212,0.12)',
    borderColor: 'rgba(6,182,212,0.28)',
  },

  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconWrapSelected: {
    backgroundColor: 'white',
  },

  roleInfo: { flex: 1 },
  roleTitle: { color: 'white', fontSize: 16, fontWeight: '800' },
  roleDesc: { color: 'rgba(255,255,255,0.7)', marginTop: 6, fontSize: 13 },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  metaText: { color: 'rgba(255,255,255,0.7)', marginLeft: 8, fontSize: 12 },

  footer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 28,
  },
  startButton: {
    height: 56,
    borderRadius: 30,
    overflow: 'hidden',
  },
  startGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startText: { color: 'white', fontWeight: '800', fontSize: 16 },
  startButtonDisabled: { opacity: 0.6 },
  startTextDisabled: { color: 'rgba(255,255,255,0.6)' }
});
