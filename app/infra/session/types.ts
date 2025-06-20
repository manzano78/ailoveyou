export interface SessionUser {
  id: string;
  nickname: string;
}

export interface SessionData {
  user: SessionUser;
}

export type FlashSessionData = {};
