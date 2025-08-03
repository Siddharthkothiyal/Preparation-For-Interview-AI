import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

type InterviewStatus = 'ready' | 'recording' | 'thinking' | 'responding' | 'completed';

export default function InterviewScreen() {
  const [status, setStatus] = useState<InterviewStatus>('ready');
  const [messages, setMessages] = useState<{text: string, isUser: boolean}[]>([]);
  const [score, setScore] = useState<number | null>(null);
  
  const startInterview = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStatus('recording');
    setMessages([{
      text: "Hello! I'm your AI interviewer today. Let's start with a simple question: Tell me about yourself and your background in software development.",
      isUser: false
    }]);
  };
  
  const simulateUserResponse = () => {
    // In a real app, this would be voice input
    setStatus('thinking');
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        text: "Hi, I'm a software developer with 3 years of experience in React Native and web development. I've worked on several mobile applications and enjoy solving complex UI challenges.",
        isUser: true
      }]);
      
      setStatus('responding');
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          text: "That's great! Can you tell me about a challenging project you worked on and how you overcame the obstacles?",
          isUser: false
        }]);
        
        setStatus('recording');
      }, 2000);
    }, 2000);
  };
  
  const endInterview = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStatus('completed');
    setScore(85); // Example score
  };

  return (
    <LinearGradient
      colors={['#1a2a6c', '#b21f1f', '#fdbb2d']}
      style={styles.container}
    >
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>AI Interview</ThemedText>
        {status === 'completed' && (
          <ThemedView style={styles.scoreContainer}>
            <ThemedText style={styles.scoreText}>Your Score</ThemedText>
            <ThemedText style={styles.score}>{score}/100</ThemedText>
          </ThemedView>
        )}
      </ThemedView>
      
      <ScrollView style={styles.chatContainer} contentContainerStyle={styles.chatContent}>
        {messages.map((message, index) => (
          <ThemedView 
            key={index} 
            style={[styles.messageBubble, message.isUser ? styles.userBubble : styles.aiBubble]}
          >
            {!message.isUser && (
              <Image 
                source={require('@/assets/images/icon.png')} 
                style={styles.aiAvatar} 
              />
            )}
            <ThemedText style={styles.messageText}>{message.text}</ThemedText>
          </ThemedView>
        ))}
        
        {status === 'thinking' && (
          <ThemedView style={[styles.messageBubble, styles.aiBubble]}>
            <Image 
              source={require('@/assets/images/icon.png')} 
              style={styles.aiAvatar} 
            />
            <ThemedText style={styles.messageText}>Thinking...</ThemedText>
          </ThemedView>
        )}
      </ScrollView>
      
      <BlurView intensity={30} style={styles.controlsContainer}>
        {status === 'ready' && (
          <TouchableOpacity style={styles.startButton} onPress={startInterview}>
            <ThemedText style={styles.buttonText}>Start Interview</ThemedText>
          </TouchableOpacity>
        )}
        
        {status === 'recording' && (
          <TouchableOpacity 
            style={styles.recordingButton} 
            onPress={simulateUserResponse}
          >
            <IconSymbol name="mic.fill" size={30} color="white" />
            <ThemedText style={styles.recordingText}>Tap to simulate response</ThemedText>
          </TouchableOpacity>
        )}
        
        {(status === 'recording' || status === 'responding') && (
          <TouchableOpacity style={styles.endButton} onPress={endInterview}>
            <ThemedText style={styles.buttonText}>End Interview</ThemedText>
          </TouchableOpacity>
        )}
        
        {status === 'completed' && (
          <ThemedView style={styles.feedbackContainer}>
            <ThemedText type="subtitle" style={styles.feedbackTitle}>Interview Feedback</ThemedText>
            <ThemedText style={styles.feedbackText}>
              You demonstrated good communication skills and technical knowledge. 
              Areas for improvement include providing more specific examples and 
              elaborating on your problem-solving approach.
            </ThemedText>
            <TouchableOpacity style={styles.startButton} onPress={() => setStatus('ready')}>
              <ThemedText style={styles.buttonText}>New Interview</ThemedText>
            </TouchableOpacity>
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
  scoreContainer: {
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  scoreText: {
    color: 'white',
    fontSize: 16,
  },
  score: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 15,
  },
  messageBubble: {
    borderRadius: 20,
    padding: 15,
    marginBottom: 10,
    maxWidth: '80%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiBubble: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
  },
  userBubble: {
    backgroundColor: 'rgba(10,126,164,0.8)',
    alignSelf: 'flex-end',
  },
  aiAvatar: {
    width: 30,
    height: 30,
    marginRight: 10,
    borderRadius: 15,
  },
  messageText: {
    color: 'white',
    flex: 1,
  },
  controlsContainer: {
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
  endButton: {
    backgroundColor: '#b21f1f',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recordingButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  recordingText: {
    color: 'white',
    marginTop: 5,
  },
  feedbackContainer: {
    backgroundColor: 'transparent',
  },
  feedbackTitle: {
    color: 'white',
    marginBottom: 10,
  },
  feedbackText: {
    color: 'white',
    marginBottom: 20,
    lineHeight: 22,
  },
});