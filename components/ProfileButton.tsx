import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Modal, View } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

import { IconSymbol } from './ui/IconSymbol';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function ProfileButton() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const handleProfilePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsModalVisible(true);
  };

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsModalVisible(false);
    // Navigate to login screen
    router.replace('/(auth)/login');
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.profileButton}
        onPress={handleProfilePress}
        activeOpacity={0.7}
      >
        <IconSymbol 
          name="person.circle.fill" 
          size={24} 
          color={colors.primary} 
        />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <BlurView intensity={30} style={styles.blurView}>
            <TouchableOpacity 
              activeOpacity={1}
              onPress={e => e.stopPropagation()}
            >
              <ThemedView style={styles.modalContent}>
                <ThemedText type="subtitle" style={styles.modalTitle}>Profile</ThemedText>
                
                <TouchableOpacity style={styles.profileOption}>
                  <IconSymbol name="person.fill" size={20} color={colors.text} />
                  <ThemedText style={styles.optionText}>Edit Profile</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.profileOption}>
                  <IconSymbol name="gear" size={20} color={colors.text} />
                  <ThemedText style={styles.optionText}>Settings</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.profileOption, styles.logoutOption]}
                  onPress={handleLogout}
                >
                  <IconSymbol name="arrow.right.square" size={20} color={colors.error} />
                  <ThemedText style={[styles.optionText, styles.logoutText]}>Logout</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </TouchableOpacity>
          </BlurView>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  profileButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  blurView: {
    borderRadius: 15,
    overflow: 'hidden',
    width: '80%',
    maxWidth: 300,
  },
  modalContent: {
    padding: 20,
    borderRadius: 15,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
  },
  profileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
  },
  logoutOption: {
    borderBottomWidth: 0,
    marginTop: 5,
  },
  logoutText: {
    color: '#FF3D71',
  },
});