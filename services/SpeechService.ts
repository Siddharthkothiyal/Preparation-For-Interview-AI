import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  voice?: string;
  onStart?: () => void;
  onDone?: () => void;
  onError?: (error: any) => void;
}

export class SpeechService {
  private static instance: SpeechService;
  private voices: Speech.Voice[] = [];
  private selectedVoice: string | undefined;
  
  private constructor() {}
  
  public static getInstance(): SpeechService {
    if (!SpeechService.instance) {
      SpeechService.instance = new SpeechService();
    }
    return SpeechService.instance;
  }
  
  public async initialize(): Promise<void> {
    try {
      this.voices = await Speech.getAvailableVoicesAsync();
      // Select a good voice for interview context
      const preferredVoice = this.voices.find(v => 
        v.identifier.includes('en-US') && v.quality === Speech.VoiceQuality.Enhanced
      );
      this.selectedVoice = preferredVoice?.identifier;
    } catch (error) {
      console.error('Failed to initialize speech service:', error);
    }
  }
  
  public async speak(text: string, options?: SpeechOptions): Promise<void> {
    try {
      // Stop any ongoing speech
      await this.stop();
      
      // Speak the text
      await Speech.speak(text, {
        voice: this.selectedVoice || options?.voice,
        rate: options?.rate || 0.9, // Slightly slower for clarity
        pitch: options?.pitch || 1.0,
        onStart: options?.onStart,
        onDone: options?.onDone,
        onError: options?.onError
      });
    } catch (error) {
      console.error('Speech error:', error);
      options?.onError?.(error);
    }
  }
  
  public async stop(): Promise<void> {
    try {
      await Speech.stop();
    } catch (error) {
      console.error('Failed to stop speech:', error);
    }
  }
  
  public getVoices(): Speech.Voice[] {
    return this.voices;
  }
}