import Voice, {
  SpeechEndEvent,
  SpeechErrorEvent,
  SpeechResultsEvent,
  SpeechStartEvent
} from '@react-native-voice/voice';
import { useCallback, useEffect, useRef, useState } from 'react';

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

  useEffect(() => {
    // Check if speech recognition is available
    const checkAvailability = async () => {
      try {
        const available = await Voice.isAvailable();
        setIsAvailable(!!available);
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
    if (!isAvailable) {
      const errorMsg = 'Speech recognition is not available on this device';
      setError(errorMsg);
      optionsRef.current?.onError?.(errorMsg);
      return;
    }

    try {
      setTranscript('');
      setError(null);
      
      const language = optionsRef.current?.language || 'en-US';
      
      await Voice.start(language, {
        EXTRA_LANGUAGE_MODEL: 'LANGUAGE_MODEL_FREE_FORM',
        EXTRA_CALLING_PACKAGE: 'com.interviewprep',
        EXTRA_PARTIAL_RESULTS: optionsRef.current?.interimResults || true,
        REQUEST_PERMISSIONS_AUTO: true,
      });
    } catch (error) {
      console.error('Failed to start listening:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to start speech recognition';
      setError(errorMsg);
      setIsListening(false);
      optionsRef.current?.onError?.(errorMsg);
    }
  }, [isAvailable]);

  const stopListening = useCallback(async () => {
    try {
      await Voice.stop();
    } catch (error) {
      console.error('Failed to stop listening:', error);
      // Don't treat stop errors as critical
      setIsListening(false);
    }
  }, []);

  const cancelListening = useCallback(async () => {
    try {
      await Voice.cancel();
      setIsListening(false);
      setTranscript('');
    } catch (error) {
      console.error('Failed to cancel listening:', error);
      setIsListening(false);
    }
  }, []);

  return {
    isListening,
    transcript,
    volumeLevel,
    isAvailable,
    error,
    startListening,
    stopListening,
    cancelListening
  };
}
