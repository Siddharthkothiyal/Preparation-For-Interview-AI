import { ReactNode } from "react";

// -------------------- INTERVIEW STATUS --------------------
export type InterviewStatus =
  | "ready"
  | "responding"
  | "recording"
  | "thinking"
  | "completed";

// -------------------- MESSAGE --------------------
export interface Message {
  text: ReactNode;
  isUser: boolean; // ✅ keep this
  role: "system" | "user" | "assistant";
  content: string;
}

// -------------------- AI RESPONSE --------------------
export interface AIResponse {
  text: string;
  analysis?: {
    tone: number;
    clarity: number;
    vocabulary: number;
    pacing: number;
    confidence: number;
  };
  feedback?: string;
}

// -------------------- FEEDBACK --------------------
export interface FeedbackData {
  tone: number;
  clarity: number;
  vocabulary: number;
  pacing: number;
  confidence: number;
  feedback: string;
}

// -------------------- EXTENDED AI MESSAGE --------------------
export interface AIMessage extends Message {}
