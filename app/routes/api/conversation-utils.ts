import { speechToText } from '~/infra/openai';

export interface ConversationItem {
  role: 'assistant' | 'user';
  content: string;
}

function toConversation(messages: string[]): Array<ConversationItem> {
  return messages.map(
    (message, i): ConversationItem => ({
      role: i % 2 === 0 ? 'assistant' : 'user', // The assistant asks first, then the user answers (and so on)
      content: message,
    }),
  );
}

export async function loadConversation(
  formData: FormData,
): Promise<Array<ConversationItem>> {
  const messages = formData.getAll('m');

  if (messages.length % 2 !== 0) {
    throw Response.json(
      {
        message:
          'The conversion length must be pair (Question > Answer > Question > Answer > ...)',
      },
      { status: 400 },
    );
  }

  if (messages.length === 0) {
    return [];
  }

  if (typeof messages[messages.length - 1] === 'string') {
    return toConversation(messages as string[]);
  }

  const lastUserAudioAnswer = messages.pop() as File;
  const lastUserAnswer = await speechToText(lastUserAudioAnswer, 'fr');

  return toConversation([...(messages as string[]), lastUserAnswer]);
}
