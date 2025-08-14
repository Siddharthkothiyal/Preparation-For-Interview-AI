import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

type InterviewStatus = 'ready' | 'recording' | 'thinking' | 'responding' | 'completed';

export default function InterviewScreen() {
  const params = useLocalSearchParams<{ roleId: string, duration: string }>();
  const roleId = params.roleId || 'frontend';
  const duration = parseInt(params.duration || '15', 10);
  
  const [status, setStatus] = useState<InterviewStatus>('ready');
  const [messages, setMessages] = useState<{text: string, isUser: boolean}[]>([]);
  const [score, setScore, ] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(duration * 60); // Convert minutes to seconds
  const [timerActive, setTimerActive] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Animation for the microphone button
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 0,
        useNativeDriver: true,
      }).stop();
    }
  }, [isRecording, pulseAnim]);
  
  // Timer countdown effect
useEffect(() => {
  let interval: ReturnType<typeof setInterval>;

  if (timerActive && timeRemaining > 0) {
    interval = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);
  } else if (timeRemaining === 0 && timerActive) {
    setTimerActive(false);
    endInterview();
    Alert.alert(
      "Time's Up!",
      "Your interview session has ended.",
      [{ text: "View Results", onPress: () => {} }]
    );
  }

  return () => clearInterval(interval);
}, [timerActive, timeRemaining]);
    


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const startInterview = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStatus('recording');
    setTimerActive(true);
    setMessages([{
      text: `Hello! I'm your AI interviewer today for the ${getRoleName(roleId)} position. Let's start with a simple question: Tell me about yourself and your background in this field.`,
      isUser: false
    }]);
  };
  
  const getRoleName = (id: string) => {
    const roleNames: {[key: string]: string} = {
      'frontend': 'Frontend Developer',
      'backend': 'Backend Developer',
      'fullstack': 'Full Stack Developer',
      'mobile': 'Mobile Developer',
      'devops': 'DevOps Engineer'
    };
    return roleNames[id] || 'Software Developer';
  };
  
  const toggleRecording = () => {
    if (!isRecording) {
      // Start recording
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsRecording(true);
    } else {
      // Stop recording and send response
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsRecording(false);
      simulateUserResponse();
    }
  };
  
  const simulateUserResponse = () => {
    // In a real app, this would process the recorded voice input
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
    setTimerActive(false);
    setScore(85); // Example score
  };

  return (
    <LinearGradient
      colors={['#1a2a6c', '#b21f1f', '#fdbb2d']}
      style={styles.container}
    >
      <ThemedView style={styles.header}>
        <ThemedView style={styles.headerContent}>
          <ThemedText type="title" style={styles.title}>AI Interview: {getRoleName(roleId)}</ThemedText>
          <ThemedView style={styles.timerContainer}>
            <IconSymbol name="clock" size={16} color="white" />
            <ThemedText style={styles.timer}>{formatTime(timeRemaining)}</ThemedText>
          </ThemedView>
        </ThemedView>
        
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
          <View style={styles.micButtonContainer}>
            <Animated.View style={{
              transform: [{ scale: pulseAnim }],
              opacity: isRecording ? 0.8 : 1
            }}>
              <TouchableOpacity 
                style={[styles.micButton, isRecording && styles.micButtonRecording]} 
                onPress={toggleRecording}
                activeOpacity={0.7}
              >
                <IconSymbol name="mic.fill" size={30} color="white" />
              </TouchableOpacity>
            </Animated.View>
            <ThemedText style={styles.recordingText}>
              {isRecording ? "Tap to send" : "Tap to record"}
            </ThemedText>
          </View>
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    color: 'white',
    flex: 1,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  timer: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
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
  micButtonContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  micButton: {
    backgroundColor: '#0a7ea4',
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  micButtonRecording: {
    backgroundColor: '#b21f1f',
  },
  recordingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 14,
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