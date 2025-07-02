export interface ProfileSummary {
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
