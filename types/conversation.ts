export type AgentRole = "user" | "assistant" | "system" | "tool";

export interface AgentMessage {
  id: string;
  role: AgentRole;
  content: string;
  createdAt: number;
  name?: string;
}

export interface VoiceState {
  listening: boolean;
  speaking: boolean;
  supported: boolean;
  lastTranscript?: string;
  error?: string;
}

export interface AppointmentPayload {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  serviceType: string;
  startTime: string;
  notes?: string;
  provider?: "calendly" | "google" | "custom";
  metadata?: Record<string, unknown>;
}

export interface ReschedulePayload {
  bookingId: string;
  newStartTime: string;
  notes?: string;
  provider?: AppointmentPayload["provider"];
}

export interface CancelPayload {
  bookingId: string;
  notes?: string;
  provider?: AppointmentPayload["provider"];
}

export interface AgentRules {
  tone: string;
  escalationCriteria: string[];
  disallowedTopics: string[];
}
