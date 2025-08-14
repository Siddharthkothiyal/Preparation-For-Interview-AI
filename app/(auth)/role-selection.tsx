import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

type InterviewRole = {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  duration: number; // in minutes
};

const interviewRoles: InterviewRole[] = [
  {
    id: 'frontend',
    title: 'Frontend Developer',
    description: 'React, Angular, Vue.js, CSS, responsive design, and frontend best practices',
    icon: 'desktopcomputer',
    color: '#4285F4',
    duration: 15,
  },
  {
    id: 'backend',
    title: 'Backend Developer',
    description: 'Node.js, Python, databases, API design, and server architecture',
    icon: 'server.rack',
    color: '#34A853',
    duration: 20,
  },
  {
    id: 'fullstack',
    title: 'Full Stack Developer',
    description: 'Frontend, backend, databases, and full application architecture',
    icon: 'laptopcomputer',
    color: '#FBBC05',
    duration: 20,
  },
  {
    id: 'mobile',
    title: 'Mobile Developer',
    description: 'React Native, iOS/Android development, and mobile UX principles',
    icon: 'iphone',
    color: '#EA4335',
    duration: 15,
  },
  {
    id: 'devops',
    title: 'DevOps Engineer',
    description: 'CI/CD, cloud infrastructure, containerization, and deployment strategies',
    icon: 'arrow.triangle.2.circlepath',
    color: '#9C27B0',
    duration: 15,
  },
  {
    id: 'uiux',
    title: 'UI/UX Designer',
    description: 'User-centered design, wireframing, prototyping, and visual design',
    icon: 'eyedropper',
    color: '#2196F3',
    duration: 15,
  },
  {
    id: 'data',
    title: 'Data Scientist',
    description: 'Statistical analysis, machine learning, data visualization, and big data tools',
    icon: 'chart.pie.fill',
    color: '#FF9800',
    duration: 20,

  },
  {
     id: 'Software ',
    title: 'Software',
    description: 'Pure DSA Rounds',
    icon: 'chart.pie.fill',
    color: '#FF9800',
    duration: 20,
  }

];

export default function RoleSelectionScreen() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleRoleSelect = (roleId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedRole(roleId);
  };

  const startInterview = () => {
    if (selectedRole) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Navigate to interview screen
      router.replace({
        pathname: '/(tabs)/interview',
        params: { 
          roleId: selectedRole,
          duration: interviewRoles.find(r => r.id === selectedRole)?.duration || 15
        }
      });
    }
  };

  return (
    <LinearGradient
      colors={['#1a2a6c', '#b21f1f', '#fdbb2d']}
      style={styles.container}
    >
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>Select Interview Role</ThemedText>
        <ThemedText style={styles.subtitle}>Choose a role for your 15-20 minute practice interview</ThemedText>
      </ThemedView>
      
      <ScrollView style={styles.rolesContainer} contentContainerStyle={styles.rolesContent}>
        {interviewRoles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[
              styles.roleCard,
              selectedRole === role.id && styles.selectedCard,
              { borderLeftColor: role.color }
            ]}
            onPress={() => handleRoleSelect(role.id)}
            activeOpacity={0.8}
          >
            <ThemedView style={[styles.iconContainer, { backgroundColor: role.color }]}>
              <IconSymbol name={role.icon as any} size={24} color="white" />
            </ThemedView>
            <ThemedView style={styles.roleInfo}>
              <ThemedText type="defaultSemiBold" style={styles.roleTitle}>{role.title}</ThemedText>
              <ThemedText style={styles.roleDescription}>{role.description}</ThemedText>
              <ThemedView style={styles.durationContainer}>
                <IconSymbol name="clock" size={14} color="white" />
                <ThemedText style={styles.duration}>{role.duration} minutes</ThemedText>
              </ThemedView>
            </ThemedView>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <BlurView intensity={30} style={styles.footer}>
        {selectedRole ? (
          <TouchableOpacity style={styles.startButton} onPress={startInterview}>
            <ThemedText style={styles.buttonText}>Start Interview</ThemedText>
          </TouchableOpacity>
        ) : (
          <ThemedView style={styles.placeholderButton}>
            <ThemedText style={styles.placeholderText}>Select a role to continue</ThemedText>
          </ThemedView>
        )}
      </BlurView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  title: {
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
  rolesContainer: {
    flex: 1,
  },
  rolesContent: {
    padding: 16,
  },
  roleCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    borderLeftWidth: 4,
  },
  selectedCard: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  roleInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  roleTitle: {
    color: 'white',
    fontSize: 18,
    marginBottom: 4,
  },
  roleDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 8,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  duration: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginLeft: 4,
  },
  footer: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  startButton: {
    backgroundColor: '#0a7ea4',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  placeholderButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
  },
});