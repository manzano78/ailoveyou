export interface SessionUser {
  id: string;
  nickname: string;
  isProfileCaptureComplete: boolean;
}

export interface SessionData {
  user: SessionUser;
}

export type FlashSessionData = {};
