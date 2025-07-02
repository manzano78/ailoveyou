import type { UserAiConversation } from './user-ai-conversation';
import type { USER_GENDERS } from './user-genders';
import type { ProfileCaptureStep } from './profile-capture-steps';
import type { ProfileSummary } from '~/domain/user/profile-summary';

export type UserGender = (typeof USER_GENDERS)[number];

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  displayName: string;
  aiConversation: UserAiConversation;
  city?: string;
  age?: number;
  gender?: UserGender;
  genderSearch?: UserGender;
  summary?: ProfileSummary;
}

export type NewUser = Omit<User, 'id' | 'aiConversation'>;
export type UserUpdate = Omit<User, 'id' | 'aiConversation'>;

export function getUserProfileCaptureStep(
  user: User,
): ProfileCaptureStep | null {
  if (user.summary) {
    return null;
  }

  if (!user.city) {
    return 'base-info';
  }

  if (!user.aiConversation.length) {
    return 'onboarding';
  }

  return 'ai-conversation';
}
