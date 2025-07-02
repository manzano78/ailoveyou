import type { ProfileCaptureStep } from '~/domain/user/profile-capture-steps';

export interface AnonymousPrincipal {
  status: 'anonymous';
  id: '';
  userName: '';
  displayName: '';
  profileCaptureStep: null;
}

export interface AuthenticatedPrincipal {
  status: 'authenticated';
  id: string;
  userName: string;
  displayName: string;
  profileCaptureStep: ProfileCaptureStep | null;
}

export type Principal = AnonymousPrincipal | AuthenticatedPrincipal;

export const ANONYMOUS_PRINCIPAL: AnonymousPrincipal = {
  status: 'anonymous',
  displayName: '',
  id: '',
  userName: '',
  profileCaptureStep: null,
};
