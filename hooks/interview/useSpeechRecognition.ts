import Voice, {
  SpeechEndEvent,
  SpeechErrorEvent,
  SpeechResultsEvent,
  SpeechStartEvent
} from '@react-native-voice/voice';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';

interface SpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  onStart?: () => void;
  onResult?: (result: string) => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
  onVolumeChanged?: (volume: number) => void;
}

export function useSpeechRecognition(options?: SpeechRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isAvailable, setIsAvailable] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const optionsRef = useRef(options);
  
  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to your microphone to record your interview answers.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        if (!isGranted) {
          Alert.alert(
            'Microphone Permission Required',
            'Voice recording requires microphone access. Please enable it in your device settings.',
            [{ text: 'OK' }]
          );
        }
        return isGranted;
      } catch (err) {
        console.error('Error requesting microphone permission:', err);
        return false;
      }
    }
    return true; // iOS handles permissions differently
  };

  useEffect(() => {
    // Check if speech recognition is available
    const checkAvailability = async () => {
      try {
        const available = await Voice.isAvailable();
        setIsAvailable(!!available);
        
        if (!available) {
          console.warn('Speech recognition not available on this device');
          Alert.alert(
            'Speech Recognition Unavailable',
            'Your device does not support speech recognition. Please use text input instead.'
          );
        }
      } catch (err) {
        console.warn('Speech recognition not available:', err);
        setIsAvailable(false);
      }
    };

    checkAvailability();

    // Set up event listeners
    const onSpeechStart = (e: SpeechStartEvent) => {
      console.log('Speech recognition started');
      setIsListening(true);
      setError(null);
      optionsRef.current?.onStart?.();
    };

    const onSpeechEnd = (e: SpeechEndEvent) => {
      console.log('Speech recognition ended');
      setIsListening(false);
      optionsRef.current?.onEnd?.();
    };

    const onSpeechResults = (e: SpeechResultsEvent) => {
      console.log('Speech results:', e.value);
      if (e.value && e.value.length > 0) {
        const text = e.value[0];
        setTranscript(text);
        optionsRef.current?.onResult?.(text);
      }
    };

    const onSpeechError = (e: SpeechErrorEvent) => {
      console.error('Speech recognition error:', e.error);
      const errorMessage = e.error?.message || e.error || 'Unknown speech recognition error';
      setError(typeof errorMessage === 'string' ? errorMessage : errorMessage.message || 'Unknown error');
      setIsListening(false);
      optionsRef.current?.onError?.(errorMessage);
    };

    const onSpeechVolumeChanged = (e: any) => {
      if (e.value !== undefined) {
        const normalizedVolume = Math.min(Math.max(e.value / 10, 0), 1);
        setVolumeLevel(normalizedVolume);
        optionsRef.current?.onVolumeChanged?.(normalizedVolume);
      }
    };

    // Assign event listeners
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechVolumeChanged = onSpeechVolumeChanged;

    // Cleanup function
    return () => {
      Voice.destroy().then(() => {
        Voice.removeAllListeners();
      }).catch(err => {
        console.warn('Error cleaning up Voice:', err);
      });
    };
  }, []);

  const startListening = useCallback(async () => {
    if (isListening) return;
    
    setTranscript('');
    setError(null);
    
    try {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        setError('Microphone permission denied');
        Alert.alert(
          'Permission Required',
          'Microphone permission is required to record your voice. Please enable it in your device settings.'
        );
        return;
      }
      
      // Check if Voice is available before starting
      try {
        const available = await Voice.isAvailable();
        if (!available) {
          setError('Speech recognition not available on this device');
          console.warn('Speech recognition not available on this device');
          return;
        }
      } catch (availabilityError) {
        console.warn('Error checking Voice availability:', availabilityError);
        // Continue anyway as this might be a false negative on some devices
      }
      
      await Voice.start(options?.language || 'en-US');
    } catch (e) {
      console.error('Error starting speech recognition:', e);
      setError(`Failed to start: ${e}`);
      Alert.alert(
        'Speech Recognition Error',
        'There was an error starting speech recognition. Please try again or use text input.'
      );
      
      // Notify the parent component about the error
      optionsRef.current?.onError?.(e);
    }
  }, [isListening, options?.language]);

  const stopListening = useCallback(async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error('Error stopping speech recognition:', e);
    }
  }, []);

  return {
    isListening,
    transcript,
    isAvailable,
    volumeLevel,
    error,
    startListening,
    stopListening,
  };
}
