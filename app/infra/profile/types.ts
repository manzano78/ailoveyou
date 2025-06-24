export interface Profile {
  age: number | null;
  created_at: string;
  gender: string | null;
  gender_search: string | null;
  id: string;
  is_complete: boolean;
  location: string | null;
  nickname: string;
  username: string;

  answer: Answer[] | null;
  transcript: string;
  profile_summary?: ProfileSummaryData;
}

export interface Answer {
  bot_question: string;
  created_at: string;
  id: string;
  user_answer_audio: string | null;
  user_answer_text: string;
  user_id: string;
}

// Add new types for profile summary
export interface ProfileSummaryData {
  name: string;
  age: number | null;
  location: string | null;
  core_values: string[];
  top_interests: string[];
  personality_style: string;
  voice_style: string;
  emotional_signature: string;
  quotes: string[];
  summary: string;
  avatar_url?: string;
}
