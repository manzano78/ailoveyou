import { Conversation } from '~/modules/profile-capture';
import { Container } from '~/components/container';
import { href, redirect, type unstable_MiddlewareFunction } from 'react-router';
import { getSessionUser } from '~/infra/session';

export const unstable_middleware: unstable_MiddlewareFunction[] = [
  // REDIRECT TO THE RIGHT PC STEP IF REQUIRED
  async ({ request }) => {
    if (request.method.toUpperCase() === 'GET') {
      if (!getSessionUser().location) {
        throw redirect(href('/profile-capture/base-info'));
      }
    }
  },
];

export default function ProfileCaptureConversationStep() {
  return (
    <Container>
      <title>Conversation</title>
      <Conversation />
    </Container>
  );
}
