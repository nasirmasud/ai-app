export type Message = { role: "user" | "assistant"; content: string };

// Simple in-memory session storage
const sessionHistory: Record<string, Message[]> = {};

// Repository functions
export const ConversationRepository = {
  getHistory(sessionId: string): Message[] {
    if (!sessionHistory[sessionId]) sessionHistory[sessionId] = [];
    return sessionHistory[sessionId];
  },

  addMessage(sessionId: string, message: Message): void {
    if (!sessionHistory[sessionId]) sessionHistory[sessionId] = [];
    sessionHistory[sessionId].push(message);
  },
};
