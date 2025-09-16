
// ---------------- Mock AI Service ----------------
// ---------------- Mock AI Service ----------------
export class AIService {
  private static instance: AIService;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // ✅ Introduction question generator (fixed placement)
  public getIntroductionQuestion(role: string): string {
    const introQuestions = {
      frontend:
        "Welcome to your frontend developer interview. Let's start with a brief introduction about yourself and your experience with frontend technologies.",
      backend:
        "Welcome to your backend developer interview. Could you start by introducing yourself and sharing your experience with backend development?",
      fullstack:
        "Welcome to your full-stack developer interview. I'd like to begin with you introducing yourself and your experience across the full technology stack.",
      mobile:
        "Welcome to your mobile developer interview. Please start by introducing yourself and your experience with mobile app development.",
      devops:
        "Welcome to your DevOps engineer interview. Let's begin with you introducing yourself and your experience with DevOps practices.",
    };

    return (
      introQuestions[role as keyof typeof introQuestions] ||
      "Welcome to your interview. Let's start with you introducing yourself and your relevant experience."
    );
  }

  // ✅ AI processing mock
  public async processInterview(message: string) {
    return {
      text: "Thanks for your response. Let's proceed.",
      analysis: {
        tone: Math.floor(Math.random() * 5) + 1,
        clarity: Math.floor(Math.random() * 5) + 1,
        vocabulary: Math.floor(Math.random() * 5) + 1,
        pacing: Math.floor(Math.random() * 5) + 1,
        confidence: Math.floor(Math.random() * 5) + 1,
      },
      feedback:
        "Good response. Try to be more specific and concise in your answers.",
    };
  }

  // ✅ AI interview question generator mock
  public async generateInterviewQuestion(role: string) {
    const questions = {
      frontend: "What are the key differences between React and Angular?",
      backend: "Can you explain what a REST API is and how it works?",
      fullstack:
        "How do you manage communication between frontend and backend in a full-stack app?",
      mobile: "What are the differences between React Native and Flutter?",
      devops:
        "Can you explain the concept of CI/CD and why it's important in DevOps?",
    };

    return (
      questions[role as keyof typeof questions] ||
      "Can you explain a challenging technical problem you solved recently?"
    );
  }
}
