export interface SessionUser {
  id: string;
  nickname: string;
  isProfileCaptureComplete: boolean;
  location?: string;
  age?: number;
  gender?: 'male' | 'female';
  genderSearch?: 'male' | 'female';
}

export interface SessionData {
  user: SessionUser;
}

export type FlashSessionData = {};
