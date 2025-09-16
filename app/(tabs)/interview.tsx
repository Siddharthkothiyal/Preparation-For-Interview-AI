import { Audio } from 'expo-av';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  PermissionsAndroid,
  Platform,
  Pressable,
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
import { FeedbackData, InterviewStatus, Message } from '@/types';

// -------------------- QUESTIONS (trimmed) --------------------
const INTERVIEW_QUESTIONS: Record<string, string[]> = {
  frontend: [
    "Tell me about your frontend experience.",
    "Explain a data structure you used in a UI feature and why.",
    "How do you ensure cross-browser compatibility?",
    "Describe your React state strategy.",
    "How do you optimize performance?"
  ],
  backend: [
    "Tell me about your backend experience.",
    "Which data structures do you prefer for in-memory caching and why?",
    "How do you design scalable APIs?",
    "Describe data modeling choices you made.",
    "How do you ensure security?"
  ],
  fullstack: [
    "Tell me about your full-stack experience.",
    "Give an example where the right data structure improved performance.",
    "How do you coordinate frontend/backend work?",
    "Describe a challenging project.",
    "How do you maintain code quality?"
  ],
  sde1: [
    "Introduce yourself and a small project you built.",
    "Explain a data structure you used recently and why.",
    "How do you debug failing tests?",
    "How do you write maintainable code?",
    "What time/space trade-offs do you consider?"
  ],
  sde2: [
    "Describe a system you designed and trade-offs.",
    "How do you approach API versioning?",
    "Explain debugging a production performance regression.",
    "Describe a concurrency problem you solved.",
    "How do you mentor juniors?"
  ],
  sde3: [
    "Describe a large system you owned.",
    "How do you evaluate and introduce new tech?",
    "Explain capacity planning and scaling strategies.",
    "Discuss a trade-off to meet business goals.",
    "How do you drive cross-team technical decisions?"
  ],
  // other roles...
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

  // services & hook
  const speechService = useRef(SpeechService.getInstance()).current;
  const {
    isListening,
    transcript,
    volumeLevel,
    startListening,
    stopListening
  } = useSpeechRecognition({
    onResult: (result) => console.log('Speech result:', result),
    onError: (err) => {
      console.error('Speech recognition error:', err);
      setSpeechAvailable(false);
      Alert.alert('Voice Recognition Unavailable', 'Speech recognition is not available on this device.');
    }
  });

  const effectiveListening = Platform.OS === 'web' ? localListening : isListening;

  useEffect(() => {
    // request microphone permission proactively on mount (expo & bare RN)
    (async () => {
      try {
        const ok = await ensureMicPermission();
        if (!ok) {
          console.warn('Microphone permission not granted on mount');
          setSpeechAvailable(false);
        }
      } catch (err) {
        console.warn('Mic permission check failed', err);
        setSpeechAvailable(false);
      }
    })();

    try { speechService.initialize(); } catch (e) { console.warn('speech init', e); setSpeechAvailable(false); }

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const w: any = window;
      const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
      if (SR) {
        webRec.current = new SR();
        webRec.current.lang = 'en-US';
        webRec.current.interimResults = false;
        webRec.current.maxAlternatives = 1;
        webRec.current.onresult = (ev: any) => {
          const text = Array.from(ev.results).map((r: any) => r[0].transcript).join(' ');
          processUserResponse(text);
          setLocalListening(false);
        };
        webRec.current.onerror = (e: any) => {
          console.error('Web SR error', e);
          setSpeechAvailable(false);
          setLocalListening(false);
        };
      } else {
        console.warn('Web Speech API not available');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  }, [effectiveListening]);

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

  const getNextQuestion = () => {
    const q = INTERVIEW_QUESTIONS[roleId] ?? INTERVIEW_QUESTIONS.frontend;
    return q[currentQuestionIndex] ?? "Thank you — any questions for us?";
  };

  const generateMockFeedback = (responses: string[]): FeedbackData => {
    const avgLength = responses.reduce((s, r) => s + r.length, 0) / Math.max(1, responses.length);
    const hasKeywords = responses.some(r => /experience|project|challenge/i.test(r));
    const base = 6 + Math.min(2, avgLength / 120) + (hasKeywords ? 1 : 0);
    const v = Math.round(Math.min(10, base));
    return { tone: v, clarity: v, vocabulary: v, pacing: v, confidence: v, feedback: avgLength > 150 ? 'Detailed answers — good.' : 'Try adding more technical examples.' };
  };

  // interview flows
  const startInterview = async () => {
    Haptics.impactAsync && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStatus('responding');
    setTimerActive(true); // ✅ start timer only here
    setCurrentQuestionIndex(0);
    setTimeRemaining(duration * 60);

    const intro = `Hello — I'm your AI interviewer for ${getRoleName(roleId)}. ${getNextQuestion()}`;
    setMessages([{ text: intro, isUser: false, role: 'system', content: '' }]);
    try {
      await speechService.speak(intro, { onDone: () => setStatus('recording') });
    } catch {
      setStatus('recording');
    }
  };

  const processUserResponse = async (userResponse: string) => {
    if (!userResponse || !userResponse.trim()) {
      Alert.alert('No input', 'Please speak or type your answer.');
      return;
    }

    setMessages(prev => [...prev, { text: userResponse, isUser: true, role: 'user', content: userResponse }]);
    setUserResponses(prev => [...prev, userResponse]);
    setStatus('thinking');

    setTimeout(async () => {
      let aiResp: string;
      if (currentQuestionIndex < 4) {
        const feedbacks = [
          "Good point — can you elaborate on the challenge?",
          "Nice detail — how did you measure success?",
          "Clear explanation. What would you do differently?"
        ];
        aiResp = `${feedbacks[Math.floor(Math.random() * feedbacks.length)]} Next: ${getNextQuestion()}`;
        setCurrentQuestionIndex(i => i + 1);
      } else {
        aiResp = "That's the end of the interview. I'll provide feedback shortly.";
        const fb = generateMockFeedback([...userResponses, userResponse]);
        setFeedbackData(fb);
        setTimeout(endInterview, 1000);
      }

      setMessages(prev => [...prev, { text: aiResp, isUser: false, role: 'system', content: aiResp }]);
      setStatus('responding');
      try {
        await speechService.speak(aiResp, { onDone: () => setStatus(currentQuestionIndex <= 4 ? 'recording' : 'completed') });
      } catch {
        setStatus(currentQuestionIndex <= 4 ? 'recording' : 'completed');
      }
    }, 900);
  };

  const endInterview = async () => {
    Haptics.notificationAsync && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try { await speechService.stop(); } catch (e) { console.warn('speech stop', e); }
    setStatus('completed');
    setTimerActive(false);
    if (feedbackData) {
      const overall = Math.round((feedbackData.tone + feedbackData.clarity + feedbackData.vocabulary + feedbackData.pacing + feedbackData.confidence) / 5 * 10);
      setScore(overall);
    } else {
      setScore(78);
    }
  };

  // microphone helpers
  async function ensureMicPermission() {
    try {
      if (Audio && typeof Audio.requestPermissionsAsync === 'function') {
        const { granted } = await Audio.requestPermissionsAsync();
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
        try { webRec.current.start(); setLocalListening(true); Haptics.impactAsync && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) { console.error(e); setTypedFallbackOpen(true); }
      } else {
        try { webRec.current.stop(); setLocalListening(false); Haptics.impactAsync && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) { console.error(e); }
      }
      return;
    }

    if (!speechAvailable) { setTypedFallbackOpen(true); return; }
    const ok = await ensureMicPermission();
    if (!ok) { setSpeechAvailable(false); Alert.alert('Permission required', 'Grant microphone permission in Settings.'); return; }

    if (!isListening) {
      try { Haptics.impactAsync && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); await startListening(); }
      catch (e) { console.error('startListening', e); setTypedFallbackOpen(true); setSpeechAvailable(false); }
    } else {
      try { Haptics.impactAsync && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); await stopListening(); setTimeout(() => processUserResponse(transcript || ''), 220); }
      catch (e) { console.error('stopListening', e); setTypedFallbackOpen(true); setSpeechAvailable(false); }
    }
  };

  const openTypedModal = () => { setTypedAnswer(''); setTypedFallbackOpen(true); };
  const closeTypedModal = () => setTypedFallbackOpen(false);
  const submitTypedAnswer = async () => { closeTypedModal(); await processUserResponse(typedAnswer.trim()); setTypedAnswer(''); };

  const openProfile = () => setProfileOpen(true);
  const closeProfile = () => setProfileOpen(false);
  const goToYourData = () => { closeProfile(); try { router.push('/'); } catch {} };
  const goToPrevious = () => { closeProfile(); try { router.push('/'); } catch {} };
  const doLogout = () => { closeProfile(); try { router.replace('/(auth)/login'); } catch {} };

  const animatePressIn = (anim: Animated.Value) => Animated.spring(anim, { toValue: 0.95, useNativeDriver: true }).start();
  const animatePressOut = (anim: Animated.Value) => Animated.spring(anim, { toValue: 1, useNativeDriver: true }).start();

  return (
    <LinearGradient colors={['#071225', '#0f1b2a']} style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Animated.View style={{ transform: [{ scale: backScale }] }}>
          <Pressable onPress={() => router.back()} onPressIn={() => animatePressIn(backScale)} onPressOut={() => animatePressOut(backScale)} style={styles.iconBtn}>
            <IconSymbol name="chevron-left" size={20} color="white" />
          </Pressable>
        </Animated.View>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>AI Interview</Text>
          <View style={styles.rolePill}>
            <IconSymbol name="badge" size={14} color="#c6fbff" />
            <Text style={styles.rolePillText}>{getRoleName(roleId)}</Text>
          </View>
        </View>

        <Animated.View style={{ transform: [{ scale: profileScale }] }}>
          <Pressable onPress={() => (profileOpen ? closeProfile() : openProfile())} onPressIn={() => animatePressIn(profileScale)} onPressOut={() => animatePressOut(profileScale)} style={styles.profileBtn}>
            <IconSymbol name="person-circle" size={30} color="white" />
          </Pressable>
        </Animated.View>
      </View>

      {/* Profile Dropdown */}
      {profileOpen && (
        <View style={styles.profileOverlay}>
          <BlurView intensity={70} style={styles.profileMenu}>
            <Pressable onPress={goToYourData} style={styles.menuItem}><Text style={styles.menuText}>Your Data</Text></Pressable>
            <Pressable onPress={goToPrevious} style={styles.menuItem}><Text style={styles.menuText}>Previous Interviews</Text></Pressable>
            <View style={styles.menuDivider} />
            <Pressable onPress={doLogout} style={styles.menuItem}><Text style={[styles.menuText, styles.logoutText]}>Logout</Text></Pressable>
          </BlurView>
        </View>
      )}

      {/* Main */}
      <KeyboardAvoidingView style={styles.main} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.panel}>
          {/* Timer & Score */}
          <View style={styles.topStats}>
            <LinearGradient colors={['#06b6d4', '#0ea5e9']} style={styles.timerCard}>
              <IconSymbol name="clock" size={18} color="white" />
                            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
            </LinearGradient>
            {score !== null && (
              <LinearGradient colors={['#22c55e', '#16a34a']} style={styles.scoreCard}>
                <IconSymbol name="star" size={18} color="white" />
                <Text style={styles.scoreText}>{score}/100</Text>
              </LinearGradient>
            )}
          </View>

          {/* Transcript */}
          <ScrollView style={styles.transcript} contentContainerStyle={{ paddingBottom: 20 }}>
            {messages.map((m, idx) => (
              <View key={idx} style={[styles.msgBubble, m.isUser ? styles.userMsg : styles.aiMsg]}>
                <Text style={[styles.msgText, m.isUser ? styles.userMsgText : styles.aiMsgText]}>
                  {m.text}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Voice / Controls */}
          <View style={styles.controls}>
            {status === 'ready' && (
              <FuturisticButton title="Start Interview" onPress={startInterview} variant="primary" />
            )}

            {status === 'recording' && (
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity style={styles.micBtn} onPress={toggleRecording}>
                  <IconSymbol name={effectiveListening ? 'mic-fill' : 'mic'} size={28} color="white" />
                  <VoiceAmplitude level={volumeLevel} listening={effectiveListening} />
                </TouchableOpacity>
              </Animated.View>
            )}

            {(status === 'recording' || status === 'responding') && (
              <FuturisticButton title="Type Answer" onPress={openTypedModal} variant="secondary" />
            )}

            {status === 'completed' && (
              <FuturisticButton
                title="End Interview"
                onPress={endInterview}
                variant="danger"
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Typed Answer Modal */}
      <Modal
        visible={typedFallbackOpen}
        animationType="slide"
        transparent
        onRequestClose={closeTypedModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Type your answer</Text>
            <TextInput
              style={styles.input}
              multiline
              value={typedAnswer}
              onChangeText={setTypedAnswer}
              placeholder="Write your response..."
              placeholderTextColor="#999"
            />
            <View style={styles.modalActions}>
              <FuturisticButton title="Cancel" onPress={closeTypedModal} variant="secondary" />
              <FuturisticButton title="Submit" onPress={submitTypedAnswer} variant="primary" />
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

// -------------------- STYLES --------------------
const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 40,
    paddingBottom: 10,
  },
  iconBtn: { padding: 6 },
  headerCenter: { alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
  },
  rolePillText: { color: '#c6fbff', fontSize: 12, marginLeft: 4 },
  profileBtn: { padding: 4 },
  profileOverlay: {
    position: 'absolute',
    top: 80,
    right: 12,
    zIndex: 50,
  },
  profileMenu: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
  },
  menuItem: { padding: 12 },
  menuText: { color: '#fff', fontSize: 14 },
  logoutText: { color: '#f87171' },
  menuDivider: { height: 1, backgroundColor: '#334155' },
  main: { flex: 1 },
  panel: {
    flex: 1,
    margin: 12,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
    padding: 16,
  },
  topStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  timerCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 8 },
  timerText: { color: '#fff', marginLeft: 6 },
  scoreCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 8 },
  scoreText: { color: '#fff', marginLeft: 6 },
  transcript: { flex: 1 },
  msgBubble: { padding: 10, borderRadius: 10, marginBottom: 8 },
  userMsg: { backgroundColor: '#0284c7', alignSelf: 'flex-end' },
  aiMsg: { backgroundColor: '#334155', alignSelf: 'flex-start' },
  msgText: { color: '#fff', fontSize: 14 },
  userMsgText: { color: '#fff' },
  aiMsgText: { color: '#cbd5e1' },
  controls: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  micBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '90%',
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: { color: '#fff', fontSize: 16, marginBottom: 12 },
  input: {
    backgroundColor: '#0f172a',
    color: '#fff',
    borderRadius: 10,
    padding: 10,
    minHeight: 80,
    marginBottom: 12,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
});

