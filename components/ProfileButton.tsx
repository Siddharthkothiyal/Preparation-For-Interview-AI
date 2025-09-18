import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Animated, Modal, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

export function ProfileButton() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [scale] = useState(new Animated.Value(1));
  
  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4
    }).start();
  };

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

  const menuItems = [
    { icon: 'person.circle', text: 'Your Data', action: () => console.log('Your Data') },
    { icon: 'lock.shield', text: 'Privacy & Security', action: () => console.log('Privacy & Security') },
    { icon: 'questionmark.circle', text: 'Helpdesk', action: () => console.log('Helpdesk') },
    { icon: 'doc.text', text: 'Data Privacy', action: () => console.log('Data Privacy') },
    { icon: 'bell', text: 'Notifications & Alerts', action: () => console.log('Notifications') },
    { icon: 'key', text: 'Login Info', action: () => console.log('Login Info') },
  ];

  return (
    <>
      <Animated.View style={[styles.profileButton, { transform: [{ scale }] }]}>
        <TouchableOpacity
          onPress={handleProfilePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.touchable}
        >
          <IconSymbol name="person.circle.fill" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <BlurView intensity={80} style={styles.blurView}>
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <ThemedView style={styles.modalContent}>
                <ThemedView style={styles.profileSection}>
                  <IconSymbol name="person.circle.fill" size={60} color={colors.text} />
                  <ThemedText style={styles.profileName}>John Doe</ThemedText>
                  <ThemedText style={styles.profileEmail}>john.doe@example.com</ThemedText>
                </ThemedView>

                <ScrollView style={styles.menuSection} showsVerticalScrollIndicator={false}>
                  {menuItems.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.menuItem}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        item.action();
                      }}
                    >
                      <IconSymbol name={item.icon} size={20} color={colors.text} />
                      <ThemedText style={styles.menuText}>{item.text}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                  <IconSymbol name="arrow.right.square" size={20} color="#FFFFFF" />
                  <ThemedText style={styles.logoutText}>Logout</ThemedText>
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  touchable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  blurView: {
    width: '85%',
    maxHeight: '80%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  profileName: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileEmail: {
    fontSize: 14,
    opacity: 0.7,
  },
  menuSection: {
    backgroundColor: 'transparent',
    maxHeight: 300,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.2)',
  },
  menuText: {
    marginLeft: 15,
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});