export interface UserAiConversationItem {
  aiAssistantQuestionText: string;
  userAnswerText: string;
  userAnswerAudioUrl: string;
}

export type UserAiConversation = UserAiConversationItem[];

export const MAX_AI_CONVERSATION_LENGTH = 6;
