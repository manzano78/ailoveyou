import { Conversation } from '~/modules/profile-capture';
import { Container } from '~/components/container';
import { loadConversationCount } from '~/modules/profile-capture/db-service';
import { MAX_CONVERSATION_LENGTH } from '~/modules/profile-capture/constants';
import { href, redirect } from 'react-router';

export async function loader() {
  const conversationLength = await loadConversationCount();

  if (conversationLength >= MAX_CONVERSATION_LENGTH) {
    throw redirect(href('/'));
  }
}

export default function ProfileCaptureConversationStep() {
  return (
    <Container>
      <Conversation />
    </Container>
  );
}
