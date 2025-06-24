import { Conversation } from '~/modules/profile-capture';
import { loadConversation } from '~/modules/profile-capture/db-service';
import type { Route } from './+types/conversation';

export async function loader() {
  const conversation = await loadConversation();

  return {
    conversationLength: conversation.length / 2,
  };
}

export default function ProfileCaptureConversationStep({
  loaderData,
}: Route.ComponentProps) {
  return <Conversation conversationLength={loaderData.conversationLength} />;
}
