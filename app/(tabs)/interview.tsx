import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  BackHandler,
  KeyboardAvoidingView,
  Modal,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { FuturisticButton } from '@/components/FuturisticButton';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { VoiceAmplitude } from '@/components/VoiceAmplitude';
import { useSpeechRecognition } from '@/hooks/interview/useSpeechRecognition';
import { SpeechService } from '@/services/SpeechService';
import SupabaseService from '@/services/SupabaseService';

// Define types
interface Message {
  text: string;
  isUser: boolean;
  role: string;
  content: string;
}

interface FeedbackData {
  summary?: string;
  strengths?: string;
  areasToImprove?: string;
  tone?: number;
  clarity?: number;
  vocabulary?: number;
  pacing?: number;
  confidence?: number;
  feedback?: string;
}

type InterviewStatus = 'ready' | 'responding' | 'recording' | 'thinking' | 'completed';

// -------------------- QUESTIONS --------------------
const INTERVIEW_QUESTIONS: Record<string, string[]> = {
  frontend: [
    "Tell me about yourself and your background in frontend development.",
    "Explain a data structure you used in a UI feature and why.",
    "How do you ensure cross-browser compatibility?",
    "Describe your React state strategy.",
    "How do you optimize performance?",
    "What's your approach to responsive design?",
    "How do you handle accessibility in your projects?",
    "Describe your experience with CSS frameworks."
  ],
  backend: [
    "Tell me about yourself and your experience in backend development.",
    "Which data structures do you prefer for in-memory caching and why?",
    "How do you design scalable APIs?",
    "Describe data modeling choices you made.",
    "How do you ensure security?",
    "Explain your approach to database optimization.",
    "How do you handle error logging and monitoring?",
    "Describe your experience with microservices."
  ],
  fullstack: [
    "Tell me about yourself and your full-stack experience.",
    "Give an example where the right data structure improved performance.",
    "How do you coordinate frontend/backend work?",
    "Describe a challenging project.",
    "How do you maintain code quality?",
    "How do you approach DevOps in your projects?",
    "Explain your testing strategy across the stack.",
    "How do you handle deployment pipelines?"
  ],
  sde1: [
    "Tell me about yourself and a small project you built.",
    "Explain a data structure you used recently and why.",
    "How do you debug failing tests?",
    "How do you write maintainable code?",
    "What time/space trade-offs do you consider?",
    "How do you approach learning new technologies?",
    "Describe your experience with version control.",
    "How do you handle code reviews?"
  ],
  sde2: [
    "Tell me about yourself and a system you designed.",
    "How do you approach API versioning?",
    "Explain debugging a production performance regression.",
    "Describe a concurrency problem you solved.",
    "How do you mentor juniors?",
    "How do you balance technical debt with new features?",
    "Describe your approach to system architecture.",
    "How do you handle incident response?"
  ],
  sde3: [
    "Tell me about yourself and a large system you owned.",
    "How do you evaluate and introduce new tech?",
    "Explain capacity planning and scaling strategies.",
    "Discuss a trade-off to meet business goals.",
    "How do you drive cross-team technical decisions?",
    "How do you approach technical leadership?",
    "Describe your experience with distributed systems.",
    "How do you balance innovation with stability?"
  ],
  data_scientist: [
    "Tell me about yourself and your background in data science.",
    "Explain a challenging data analysis project you worked on.",
    "How do you approach feature engineering?",
    "Describe your experience with machine learning models.",
    "How do you validate your models?",
    "Explain how you communicate technical findings to non-technical stakeholders.",
    "How do you handle imbalanced datasets?",
    "Describe your experience with big data technologies."
  ],
  product_manager: [
    "Tell me about yourself and your product management experience.",
    "How do you prioritize features?",
    "Describe how you work with engineering teams.",
    "How do you gather and incorporate user feedback?",
    "Explain how you measure product success.",
    "How do you handle stakeholder disagreements?",
    "Describe a product launch you managed.",
    "How do you balance short-term wins with long-term vision?"
  ]
};

// -------------------- COMPONENT --------------------
export default function InterviewScreen() {
  const params = useLocalSearchParams<{ role?: string; roleId?: string; duration?: string }>();
  const router = useRouter();
  const selectedRole = (params.role ?? params.roleId ?? 'frontend') as string;
  const roleId = selectedRole || 'frontend';
  const duration = parseInt(params.duration || '15', 10);

  // interview state
  const [status, setStatus] = useState<InterviewStatus>('ready');
  const [messages, setMessages] = useState<Message[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(duration * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // UI state
  const [profileOpen, setProfileOpen] = useState(false);
  const backScale = useRef(new Animated.Value(1)).current;
  const profileScale = useRef(new Animated.Value(1)).current;

  // typed fallback modal
  const [typedFallbackOpen, setTypedFallbackOpen] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState('');

  // speech availability & web fallback
  const [speechAvailable, setSpeechAvailable] = useState(true);
  const webRec = useRef<any | null>(null);
  const [localListening, setLocalListening] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);

  // services & hook
  const speechService = useRef(SpeechService.getInstance()).current;
  const {
    isListening,
    transcript,
    startListening,
    stopListening
  } = useSpeechRecognition({
    onResult: (result) => console.log('Speech result:', result),
    onVolumeChanged: (level) => setVolumeLevel(level),
    onError: (err) => {
      console.error('Speech recognition error:', err);
      setSpeechAvailable(false);
      Alert.alert('Voice Recognition Unavailable', 'Speech recognition is not available on this device.');
    }
  });

  const effectiveListening = Platform.OS === 'web' ? localListening : isListening;

  // Handle back button and cleanup resources
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      router.back();
      return true;
    });

    // Return cleanup function to prevent memory leaks
    return () => {
      backHandler.remove();

      // Stop any ongoing speech or recording
      if (speechService) {
        try { speechService.stop(); } catch (e) { console.warn('Speech stop error', e); }
      }

      // Stop listening if active
      if (isListening) {
        try { stopListening(); } catch (e) { console.warn('Stop listening error', e); }
      }

      // Clear any timers
      if (timerActive) {
        setTimerActive(false);
      }
    };
  }, [router, isListening, stopListening, speechService, timerActive]);

  useEffect(() => {
    let isMounted = true;

    // request microphone permission proactively on mount
    (async () => {
      try {
        const ok = await ensureMicPermission();
        if (!ok && isMounted) {
          console.warn('Microphone permission not granted on mount');
          setSpeechAvailable(false);
          Alert.alert(
            'Microphone Access Required',
            'To use the interview feature, please grant microphone access in your device settings.',
            [{ text: 'OK' }]
          );
        }
      } catch (err) {
        console.warn('Mic permission check failed', err);
        if (isMounted) setSpeechAvailable(false);
        Alert.alert(
          'Speech Recognition Error',
          'There was an error initializing speech recognition. Please try again later.',
          [{ text: 'OK' }]
        );
      }
    })();

    try {
      speechService.initialize();
    } catch (e) {
      console.warn('speech init', e);
      if (isMounted) setSpeechAvailable(false);
      Alert.alert(
        'Speech Recognition Unavailable',
        'Your device does not support speech recognition. Some features may be limited.',
        [{ text: 'OK' }]
      );
    }

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };

  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => setTimeRemaining(prev => Math.max(0, prev - 1)), 1000);
    } else if (timerActive && timeRemaining === 0) {
      setTimerActive(false);
      endInterview();
    }
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

  useEffect(() => {
    if (effectiveListening) {
      const pulseSequence = Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.18, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true })
      ]);
      Animated.loop(pulseSequence).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [effectiveListening, pulseAnim]);

  // helpers
  const formatTime = (secs: number) => {
    const mm = Math.floor(secs / 60).toString().padStart(2, '0');
    const ss = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const getRoleName = (id: string) => {
    const map: Record<string, string> = {
      sde1: 'SDE I', sde2: 'SDE II', sde3: 'SDE III',
      frontend: 'Frontend Developer', backend: 'Backend Developer', fullstack: 'Fullstack Developer',
      devops: 'DevOps Engineer', datasci: 'Data Scientist',
      hr_recruiter: 'HR Recruiter', hr_manager: 'HR Manager',
      intern_software: 'Software Intern', intern_data: 'Data Intern'
    };
    return map[id] || id || 'Software Developer';
  };

  // Randomize and prepare questions for the current role
  const [randomizedQuestions, setRandomizedQuestions] = useState<string[]>([]);

  useEffect(() => {
    const roleQuestions = [...(INTERVIEW_QUESTIONS[roleId] ?? INTERVIEW_QUESTIONS.frontend)];

    // Always ensure the first question is an introduction
    const introQuestion = roleQuestions.find(q => q.toLowerCase().includes("tell me about yourself"));
    let randomized: string[] = [];

    if (introQuestion) {
      // Remove the intro question from the array
      const filteredQuestions = roleQuestions.filter(q => q !== introQuestion);
      // Shuffle the remaining questions
      const shuffled = filteredQuestions.sort(() => Math.random() - 0.5);
      // Put the intro question first
      randomized = [introQuestion, ...shuffled];
    } else {
      // If no intro question found, just shuffle all questions
      randomized = roleQuestions.sort(() => Math.random() - 0.5);
    }

    setRandomizedQuestions(randomized);
  }, [roleId]);

  const getNextQuestion = (idx = currentQuestionIndex) => {
    return randomizedQuestions[idx] ?? "Thank you — any questions for us?";
  };

  const generateMockFeedback = (responses: string[]): FeedbackData => {
    const avgLength = responses.reduce((s, r) => s + r.length, 0) / Math.max(1, responses.length);
    const hasKeywords = responses.some(r => /experience|project|challenge/i.test(r));
    const base = 6 + Math.min(2, avgLength / 120) + (hasKeywords ? 1 : 0);
    const v = Math.round(Math.min(10, base));

    return {
      tone: v,
      clarity: v,
      vocabulary: v,
      pacing: v,
      confidence: v,
      feedback: avgLength > 150 ? 'Detailed answers — good.' : 'Try adding more technical examples.',
      summary: 'Overall, your interview was good. You provided clear answers and demonstrated technical knowledge.',
      strengths: 'Technical knowledge, clear communication',
      areasToImprove: 'Add more specific examples, elaborate on technical details'
    };
  };

  // interview flows
  const startInterview = async () => {
    Haptics.impactAsync && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStatus('responding');
    setTimerActive(true);
    setCurrentQuestionIndex(0);
    setTimeRemaining(duration * 60);

    const intro = `Hello — I'm your AI interviewer for ${getRoleName(roleId)}. ${getNextQuestion(0)}`;
    setMessages([{ text: intro, isUser: false, role: 'system', content: '' }]);
    try {
      await speechService.speak(intro, { onDone: () => setStatus('recording') });
    } catch (error) {
      console.error('Speech error:', error);
      setStatus('recording');
    }
  };

  const processUserResponse = async (userResponse: string) => {
    if (!userResponse || !userResponse.trim()) {
      Alert.alert('No input', 'Please speak or type your answer.');
      return;
    }

    // capture index at time of response to avoid stale closures
    const idx = currentQuestionIndex;
    const qLen = randomizedQuestions.length;

    setMessages(prev => [...prev, { text: userResponse, isUser: true, role: 'user', content: userResponse }]);
    setUserResponses(prev => [...prev, userResponse]);
    setStatus('thinking');

    setTimeout(async () => {
      let aiResp: string;
      const nextIdx = idx + 1;

      if (nextIdx < qLen) {
        const feedbacks = [
          "Good point — can you elaborate on the challenge?",
          "Nice detail — how did you measure success?",
          "Clear explanation. What would you do differently?"
        ];
        // Include the next question in the response to make the flow more natural
        aiResp = `${feedbacks[Math.floor(Math.random() * feedbacks.length)]} Next question: ${getNextQuestion(nextIdx)}`;
        setCurrentQuestionIndex(nextIdx);
      } else {
        aiResp = "That's the end of the interview. I'll provide feedback shortly.";
        const fb = generateMockFeedback([...userResponses, userResponse]);
        setFeedbackData(fb);
        setTimeout(endInterview, 1000);
      }

      setMessages(prev => [...prev, { text: aiResp, isUser: false, role: 'system', content: aiResp }]);
      setStatus('responding');

      try {
        await speechService.speak(aiResp, { onDone: () => setStatus(nextIdx < qLen ? 'recording' : 'completed') });
      } catch (error) {
        console.error('Speech error:', error);
        setStatus(nextIdx < qLen ? 'recording' : 'completed');
      }
    }, 900);
  };

  const saveInterviewData = async () => {
    try {
      const supabase = SupabaseService.getInstance();
      const user = await supabase.getCurrentUser();

      if (user) {
        const client = supabase.getSupabase();
        if (!client) {
          console.warn('Supabase client not initialized');
          return;
        }
        const { error } = await client
          .from('interviews')
          .insert({
            user_id: user.id,
            role: selectedRole,
            questions: randomizedQuestions,
            responses: userResponses,
            feedback: feedbackData,
            score: score,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
        console.log('Interview data saved successfully');
      }
    } catch (error) {
      console.error('Error saving interview data:', error);
      // Don't show alert to user to avoid disrupting the experience
    }
  };

  const endInterview = async () => {
    Haptics.notificationAsync && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try { await speechService.stop(); } catch (e) { console.warn('speech stop', e); }
    setStatus('completed');
    setTimerActive(false);
    if (feedbackData) {
      const sum =
        (feedbackData.tone ?? 0) +
        (feedbackData.clarity ?? 0) +
        (feedbackData.vocabulary ?? 0) +
        (feedbackData.pacing ?? 0) +
        (feedbackData.confidence ?? 0);
      const avg = sum / 5; // 1..10
      const overall = Math.round(avg * 10); // convert to 0..100
      setScore(overall);

      // Save interview data after setting the score
      await saveInterviewData();
    } else {
      setScore(78);
      await saveInterviewData();
    }
  };

  // microphone helpers
  async function ensureMicPermission() {
    try {
      // prefer expo-av requestPermissionsAsync when available
      if (Audio && typeof (Audio as any).requestPermissionsAsync === 'function') {
        const { granted } = await (Audio as any).requestPermissionsAsync();
        return granted;
      }
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, {
          title: 'Microphone Permission',
          message: 'Microphone access is required to record your answers.',
          buttonPositive: 'OK'
        });
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      // iOS/others - assume permission handled by OS or previously granted
      return true;
    } catch (e) {
      console.warn('ensureMicPermission error', e);
      return false;
    }
  }

  const toggleRecording = async () => {
    if (Platform.OS === 'web') {
      if (!webRec.current) {
        Alert.alert('No speech support', 'Your browser does not support speech recognition. Use the typed fallback.');
        setTypedFallbackOpen(true);
        return;
      }
      if (!localListening) {
        try {
          webRec.current.start();
          setLocalListening(true);
          Haptics.impactAsync && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (e) {
          console.error(e);
          setTypedFallbackOpen(true);
        }
      } else {
        try {
          webRec.current.stop();
          setLocalListening(false);
          Haptics.impactAsync && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (e) {
          console.error(e);
        }
      }
      return;
    }

    if (!speechAvailable) {
      setTypedFallbackOpen(true);
      return;
    }

    const ok = await ensureMicPermission();
    if (!ok) {
      setSpeechAvailable(false);
      Alert.alert('Permission required', 'Grant microphone permission in Settings.');
      return;
    }

    if (!isListening) {
      try {
        Haptics.impactAsync && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await startListening();
      } catch (e) {
        console.error('startListening', e);
        setTypedFallbackOpen(true);
        setSpeechAvailable(false);
      }
    } else {
      try {
        Haptics.impactAsync && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await stopListening();
        setTimeout(() => processUserResponse(transcript || ''), 220);
      } catch (e) {
        console.error('stopListening', e);
        setTypedFallbackOpen(true);
        setSpeechAvailable(false);
      }
    }
  };

  const openTypedModal = () => {
    setTypedAnswer('');
    setTypedFallbackOpen(true);
  };

  const closeTypedModal = () => setTypedFallbackOpen(false);

  const submitTypedAnswer = async () => {
    closeTypedModal();
    await processUserResponse(typedAnswer.trim());
    setTypedAnswer('');
  };

  const openProfile = () => setProfileOpen(true);
  const closeProfile = () => setProfileOpen(false);
  const goToYourData = () => { closeProfile(); try { router.push('/'); } catch {} };
  const goToPrevious = () => { closeProfile(); try { router.push('/'); } catch {} };
  const doLogout = () => { closeProfile(); try { router.replace('/(auth)/login'); } catch {} };

  const animatePressIn = (anim: Animated.Value) => Animated.spring(anim, { toValue: 0.95, useNativeDriver: true }).start();
  const animatePressOut = (anim: Animated.Value) => Animated.spring(anim, { toValue: 1, useNativeDriver: true }).start();

  // Handle back button
  const handleBackPress = () => {
    Haptics.impactAsync && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButtonText: {
      color: '#FFFFFF',
      marginLeft: 8,
    },
    roleContainer: {
      alignItems: 'center',
    },
    roleText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    timerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    timerText: {
      color: '#FFFFFF',
      marginLeft: 4,
    },
    profileButton: {
      padding: 8,
    },
    chatContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    chatHeader: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    chatTitle: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600',
    },
    timer: {
      color: '#FFFFFF',
      marginTop: 4,
    },
    messagesContainer: {
      flex: 1,
      padding: 16,
    },
    messageBox: {
      padding: 12,
      borderRadius: 12,
      marginBottom: 8,
      maxWidth: '80%',
    },
    userMessage: {
      backgroundColor: '#4A90E2',
      alignSelf: 'flex-end',
    },
    aiMessage: {
      backgroundColor: '#2C2C2E',
      alignSelf: 'flex-start',
    },
    messageText: {
      color: '#FFFFFF',
    },
    feedbackMessage: {
      backgroundColor: '#1C1C1E',
      padding: 16,
      margin: 8,
    },
    feedbackTitle: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8,
    },
    feedbackText: {
      color: '#FFFFFF',
      marginBottom: 8,
    },
    feedbackStrengths: {
      color: '#4CD964',
      marginBottom: 4,
    },
    feedbackAreas: {
      color: '#FF9500',
    },
    startContainer: {
      padding: 16,
      alignItems: 'center',
    },
    startButton: {
      width: '100%',
    },
    inputContainer: {
      flexDirection: 'row',
      padding: 16,
      alignItems: 'center',
    },
    recordButton: {
      padding: 12,
      borderRadius: 24,
      backgroundColor: '#2C2C2E',
    },
    recordingActive: {
      backgroundColor: '#FF3B30',
    },
    textInput: {
      flex: 1,
      marginHorizontal: 12,
      padding: 12,
      backgroundColor: '#2C2C2E',
      borderRadius: 20,
      color: '#FFFFFF',
    },
    sendButton: {
      padding: 8,
    },
    completedContainer: {
      padding: 16,
      alignItems: 'center',
    },
    scoreText: {
      color: '#FFFFFF',
      fontSize: 24,
      fontWeight: '600',
      marginBottom: 16,
    },
    newInterviewButton: {
      width: '100%',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    keyboardAvoid: {
      width: '100%',
    },
    modalContent: {
      backgroundColor: '#1C1C1E',
      padding: 16,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    modalTitle: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 16,
    },
    modalTextInput: {
      backgroundColor: '#2C2C2E',
      borderRadius: 12,
      padding: 12,
      color: '#FFFFFF',
      height: 120,
      textAlignVertical: 'top',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 16,
    },
    modalButton: {
      padding: 12,
      marginLeft: 8,
    },
    modalButtonText: {
      color: '#4A90E2',
    },
    submitButton: {
      backgroundColor: '#4A90E2',
      borderRadius: 8,
    },
    submitButtonText: {
      color: '#FFFFFF',
    },
  });

  return (
    <LinearGradient colors={['#000000', '#121212', '#1E1E1E']} style={styles.container}>
      {/* Top bar with back button and timer */}
      <View style={styles.topBar}>
        <Animated.View style={{ transform: [{ scale: backScale }] }}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            onPressIn={() => animatePressIn(backScale)}
            onPressOut={() => animatePressOut(backScale)}
          >
            <IconSymbol name="chevron-left" size={24} color="#FFFFFF" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.roleContainer}>
          <Text style={styles.roleText}>{getRoleName(roleId)}</Text>
          {timerActive && (
            <View style={styles.timerContainer}>
              <IconSymbol name="clock" size={16} color="#FFFFFF" />
              <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
            </View>
          )}
        </View>

        <Animated.View style={{ transform: [{ scale: profileScale }] }}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={openProfile}
            onPressIn={() => animatePressIn(profileScale)}
            onPressOut={() => animatePressOut(profileScale)}
          >
            <IconSymbol name="person" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Chat Interface */}
      <View style={styles.chatContainer}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatTitle}>AI Interview: {getRoleName(roleId)}</Text>
          {timerActive && (
            <Text style={styles.timer}>{formatTime(timeRemaining)}</Text>
          )}
        </View>

        <ScrollView style={styles.messagesContainer}>
          {messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageBox,
                message.isUser ? styles.userMessage : styles.aiMessage
              ]}
            >
              <Text style={styles.messageText}>{message.text}</Text>
            </View>
          ))}

          {feedbackData && (
            <View style={[styles.messageBox, styles.feedbackMessage]}>
              <Text style={styles.feedbackTitle}>Interview Feedback</Text>
              <Text style={styles.feedbackText}>{feedbackData.summary}</Text>
              <Text style={styles.feedbackStrengths}>Strengths: {feedbackData.strengths}</Text>
              <Text style={styles.feedbackAreas}>Areas to Improve: {feedbackData.areasToImprove}</Text>
            </View>
          )}
        </ScrollView>

        {status === 'ready' ? (
          <View style={styles.startContainer}>
            <FuturisticButton
              title="Start Interview"
              onPress={startInterview}
              style={styles.startButton}
            />
          </View>
        ) : status !== 'completed' ? (
          <View style={styles.inputContainer}>
            {/* Voice Recording Button */}
            <TouchableOpacity
              style={[
                styles.recordButton,
                effectiveListening && styles.recordingActive
              ]}
              onPress={toggleRecording}
            >
              <IconSymbol
                name={effectiveListening ? "stop-fill" : "mic-fill"}
                size={24}
                color="#FFFFFF"
              />
              {effectiveListening && <VoiceAmplitude level={volumeLevel} />}
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              placeholder="Type your answer..."
              placeholderTextColor="#8A8A8A"
              value={typedAnswer}
              onChangeText={setTypedAnswer}
              multiline
            />

            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => {
                if (typedAnswer.trim()) {
                  processUserResponse(typedAnswer);
                  setTypedAnswer('');
                }
              }}
            >
              <IconSymbol name="arrow-up-circle-fill" size={32} color="#4A90E2" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.completedContainer}>
            <Text style={styles.scoreText}>Score: {score}%</Text>
            <FuturisticButton
              title="New Interview"
              onPress={() => {
                setStatus('ready');
                setMessages([]);
                setUserResponses([]);
                setFeedbackData(null);
                setScore(null);
              }}
              style={styles.newInterviewButton}
            />
          </View>
        )}
      </View>

      {/* Typed Answer Modal */}
      <Modal
        visible={typedFallbackOpen}
        transparent
        animationType="fade"
        onRequestClose={closeTypedModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeTypedModal}
        >
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoid}>
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Type Your Answer</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="Enter your response here..."
                  placeholderTextColor="#8A8A8A"
                  value={typedAnswer}
                  onChangeText={setTypedAnswer}
                  multiline
                  autoFocus
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.modalButton} onPress={closeTypedModal}>
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.submitButton]}
                    onPress={submitTypedAnswer}
                  >
                    <Text style={styles.submitButtonText}>Submit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
}

