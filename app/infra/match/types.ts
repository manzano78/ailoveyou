export interface AudioClip {
  id: string;
  url: string;
  duration: number;
  prompt: string;
  createdAt: string;
}

export interface PersonalityTrait {
  id: string;
  emoji: string;
  label: string;
  category: 'primary' | 'secondary';
}

export interface MatchUser {
  id: string;
  username: string;
  nickname: string;
  voiceClips: AudioClip[];
  personalityTraits: PersonalityTrait[];
  chemistryScore: number;
  discoveryInsights: string[];
}

export interface IceBreaker {
  id: string;
  question: string;
  answers: string[];
  correctAnswer?: string;
}

export interface ResonanceDiscovery {
  status: 'searching' | 'found' | 'complete';
  progress: number;
  agentsMet: number;
  conversations: number;
  resonanceFound: number;
  matchedUser?: MatchUser;
}
