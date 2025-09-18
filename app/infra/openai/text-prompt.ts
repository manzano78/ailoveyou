import { openAI } from '~/infra/openai/client';
import { eventStream } from 'remix-utils/sse/server';

export interface EndingEvent {
  event: string;
  data: string;
}

export async function textPrompt({
  messages,
  abortSignal,
  sendEndingMarker = true,
  sendResponseId = false,
  endingEvents,
  previousResponseId,
}: {
  messages: {
    role: 'user' | 'assistant' | 'system' | 'developer';
    content: string;
  }[];
  abortSignal: AbortSignal;
  sendEndingMarker?: boolean;
  sendResponseId?: boolean;
  previousResponseId?: string | null;
  endingEvents?: EndingEvent[];
}): Promise<Response> {
  const responseStream = openAI.responses.stream({
    model: 'gpt-4o',
    store: true,
    input: messages,
    previous_response_id: previousResponseId,
  });

  return eventStream(abortSignal, (send, close) => {
    (async () => {
      for await (const event of responseStream) {
        switch (event.type) {
          case 'response.output_text.delta':
            send({ data: event.delta });
            break;
          case 'response.completed':
            if (sendResponseId) {
              send({ event: 'response-id', data: event.response.id });
            }
            break;
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
