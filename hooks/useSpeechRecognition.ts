import Voice, {
  SpeechEndEvent,
  SpeechErrorEvent,
  SpeechResultsEvent,
  SpeechStartEvent,
  SpeechVolumeChangeEvent,
} from '@react-native-voice/voice';
import { useCallback, useEffect, useState } from 'react';

interface SpeechRecognitionOptions {
  continuous?: boolean; // not directly supported, but can be handled manually
  interimResults?: boolean; // handled internally by Voice
  onStart?: () => void;
  onResult?: (result: string) => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

export function useSpeechRecognition(options?: SpeechRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isAvailable, setIsAvailable] = useState(true); // Assume available

  // Set up listeners
  useEffect(() => {
    Voice.onSpeechStart = (_event: SpeechStartEvent) => {
      setIsListening(true);
      options?.onStart?.();
    };

    Voice.onSpeechResults = (event: SpeechResultsEvent) => {
      const text = event.value?.[0] || '';
      setTranscript(text);
      options?.onResult?.(text);
    };

    Voice.onSpeechError = (event: SpeechErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      options?.onError?.(event.error);
    };

    Voice.onSpeechEnd = (_event: SpeechEndEvent) => {
      setIsListening(false);
      options?.onEnd?.();
    };

    Voice.onSpeechVolumeChanged = (event: SpeechVolumeChangeEvent) => {
      const normalized = Math.max(0, Math.min(1, (event.value ?? 0) / 10));
      setVolumeLevel(normalized);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [options]);

  // Start listening
  const startListening = useCallback(async () => {
    try {
      setTranscript('');
      await Voice.start('en-US'); // Change language if needed
    } catch (error) {
      console.error('Failed to start listening:', error);
      options?.onError?.(error);
    }
  }, [options]);

  // Stop listening
  const stopListening = useCallback(async () => {
    try {
      await Voice.stop();
    } catch (error) {
      console.error('Failed to stop listening:', error);
    }
  }, []);

  return {
    isListening,
    transcript,
    volumeLevel,
    isAvailable,
    startListening,
    stopListening,
  };
}
