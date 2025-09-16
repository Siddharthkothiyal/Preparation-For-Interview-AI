export interface FeedbackData {
  tone: number;
  clarity: number;
  vocabulary: number;
  pacing: number;
  confidence: number;
  feedback: string;
}

export class FeedbackService {
  private static instance: FeedbackService;
  
  private constructor() {}
  
  public static getInstance(): FeedbackService {
    if (!FeedbackService.instance) {
      FeedbackService.instance = new FeedbackService();
    }
    return FeedbackService.instance;
  }
  
  public calculateOverallScore(feedbackData: FeedbackData): number {
    const { tone, clarity, vocabulary, pacing, confidence } = feedbackData;
    
    // Calculate weighted average (all equal weights for now)
    const overallScore = Math.round(
      (tone + clarity + vocabulary + pacing + confidence) / 5 * 10
    );
    
    return overallScore;
  }
  
  public generateSummary(feedbackData: FeedbackData): string {
    const { tone, clarity, vocabulary, pacing, confidence } = feedbackData;
    const overallScore = this.calculateOverallScore(feedbackData);
    
    let summary = `Your interview performance scored ${overallScore}/100. `;
    
    // Identify strengths (scores >= 7)
    const strengths = [];
    if (tone >= 7) strengths.push('tone');
    if (clarity >= 7) strengths.push('clarity');
    if (vocabulary >= 7) strengths.push('vocabulary');
    if (pacing >= 7) strengths.push('pacing');
    if (confidence >= 7) strengths.push('confidence');
    
    // Identify areas for improvement (scores < 6)
    const improvements = [];
    if (tone < 6) improvements.push('tone');
    if (clarity < 6) improvements.push('clarity');
    if (vocabulary < 6) improvements.push('vocabulary');
    if (pacing < 6) improvements.push('pacing');
    if (confidence < 6) improvements.push('confidence');
    
    // Add strengths to summary
    if (strengths.length > 0) {
      summary += `Your strengths include ${strengths.join(', ')}. `;
    }
    
    // Add areas for improvement to summary
    if (improvements.length > 0) {
      summary += `Consider improving your ${improvements.join(', ')}. `;
    }
    
    return summary;
  }
}