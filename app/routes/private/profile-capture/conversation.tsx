import { Conversation } from '~/modules/profile-capture';
import { loadConversation } from '~/modules/profile-capture/db-service';
import type { Route } from './+types/conversation';
import { Container } from '~/components/container';

export async function loader() {
  const conversation = await loadConversation();

  return {
    conversationLength: conversation.length / 2,
  };
}

export default function ProfileCaptureConversationStep({
  loaderData,
}: Route.ComponentProps) {
  return (
    <Container>
      <Conversation conversationLength={loaderData.conversationLength} />
    </Container>
  );
}
