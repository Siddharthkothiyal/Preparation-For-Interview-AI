import * as Speech from 'expo-speech';

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
  private isSpeaking: boolean = false;
  
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
      console.log('Speech service initialized with voice:', this.selectedVoice);
    } catch (error) {
      console.error('Failed to initialize speech service:', error);
    }
  }
  
  public async speak(text: string, options?: SpeechOptions): Promise<void> {
    try {
      // Validate input
      if (!text || text.trim() === '') {
        console.warn('SpeechService: Empty text provided');
        options?.onDone?.(); // Call onDone to continue the flow
        return;
      }
      
      // Stop any ongoing speech
      if (this.isSpeaking) {
        await this.stop();
      }
      
      // Check if speech is available
      const isSpeechAvailable = await Speech.isSpeakingAsync();
      
      this.isSpeaking = true;
      options?.onStart?.();
      
      // Use a timeout to ensure onDone is called even if speech fails
      const timeoutId = setTimeout(() => {
        if (this.isSpeaking) {
          console.warn('SpeechService: Speech timeout occurred');
          this.isSpeaking = false;
          options?.onDone?.();
        }
      }, 30000); // 30 second timeout
      
      // Speak the text
      await Speech.speak(text, {
        voice: options?.voice || this.selectedVoice,
        rate: options?.rate || 0.9, // Slightly slower for clarity
        pitch: options?.pitch || 1.0,
        onStart: () => {
          console.log('Speech started');
        },
        onDone: () => {
          clearTimeout(timeoutId);
          console.log('Speech finished');
          this.isSpeaking = false;
          options?.onDone?.();
        },
        onError: (error) => {
          clearTimeout(timeoutId);
          console.error('SpeechService: Speech error:', error);
          this.isSpeaking = false;
          options?.onError?.(error);
        }
      });
    } catch (error) {
      console.error('SpeechService: Exception during speak:', error);
      this.isSpeaking = false;
      options?.onError?.(error);
      options?.onDone?.(); // Ensure onDone is called even on error
    }
  }
  
  public async speakFeedback(feedback: any): Promise<void> {
    if (!feedback) return;
    
    const feedbackText = `
      Here's my feedback on your interview performance.
      ${feedback.summary || ''}
      Your strengths include: ${feedback.strengths || 'Good communication skills.'}
      Areas to improve: ${feedback.areasToImprove || 'Practice more specific examples.'}
    `;
    
    await this.speak(feedbackText, {
      rate: 0.85, // Slightly slower for feedback
      pitch: 1.0
    });
  }
  
  public async stop(): Promise<void> {
    try {
      if (this.isSpeaking) {
        await Speech.stop();
        this.isSpeaking = false;
      }
    } catch (error) {
      console.error('Error stopping speech:', error);
      // Don't rethrow the error, just ensure isSpeaking is reset
      this.isSpeaking = false;
    }
  }
  
  public getVoices(): Speech.Voice[] {
    return this.voices;
  }
  
  public isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }
}