import type { AIResponse } from '@/services/AIService';
import { AIService, Message } from '@/services/AIService';
import { useCallback, useState } from 'react';

export function useAIProcessing(apiKey: string) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const aiService = AIService.getInstance(apiKey);
  
  const processResponse = useCallback(async (
    messages: Message[], 
    analyzeResponse = false
  ): Promise<AIResponse | null> => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await aiService.processInterview(messages, analyzeResponse);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [aiService]);
  
  return {
    isProcessing,
    error,
    processResponse
  };
}