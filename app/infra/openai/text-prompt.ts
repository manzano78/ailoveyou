import { openAI } from '~/infra/openai/client';
import { eventStream } from 'remix-utils/sse/server';

export type Messages = Parameters<
  typeof openAI.chat.completions.create
>[0]['messages'];

export async function textPrompt({
  messages,
  abortSignal,
}: {
  messages: Messages;
  abortSignal: AbortSignal;
}): Promise<Response> {
  const stream = await openAI.chat.completions.create({
    model: 'gpt-4o',
    stream: true,
    messages,
  });

  return eventStream(abortSignal, (send) => {
    (async () => {
      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content;

        if (delta) {
          send({ data: delta });
        }
      }

      send({ data: '[DONE]' });
    })();

    return () => {};
  });
}
