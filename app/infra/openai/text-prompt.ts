import { openAI } from '~/infra/openai/client';
import { eventStream } from 'remix-utils/sse/server';

export type Messages = Parameters<
  typeof openAI.chat.completions.create
>[0]['messages'];

export interface EndingEvent {
  event: string;
  data: string;
}

export async function textPrompt({
  messages,
  abortSignal,
  sendEndingMarker = true,
  endingEvents,
}: {
  messages: Messages;
  abortSignal: AbortSignal;
  sendEndingMarker?: boolean;
  endingEvents?: EndingEvent[];
}): Promise<Response> {
  const stream = await openAI.chat.completions.create({
    model: 'gpt-4o',
    stream: true,
    messages,
  });

  return eventStream(abortSignal, (send, close) => {
    (async () => {
      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content;

        if (delta) {
          send({ data: delta });
        }
      }

      if (endingEvents?.length) {
        for (const event of endingEvents) {
          send(event);
        }
      }

      if (sendEndingMarker) {
        send({ data: '[DONE]' });
      }

      close();
    })();

    return () => {};
  });
}
