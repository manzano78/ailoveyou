import { openAI } from '~/infra/openai/client';
import { eventStream } from 'remix-utils/sse/server';

export async function textPrompt({
  input,
  instructions,
  abortSignal,
}: {
  instructions: string;
  input: string;
  abortSignal: AbortSignal;
}): Promise<Response> {
  const stream = await openAI.chat.completions.create({
    model: 'gpt-4o',
    stream: true,
    messages: [
      { role: 'developer', content: instructions },
      { role: 'user', content: input },
    ],
  });

  return eventStream(abortSignal, (send) => {
    (async () => {
      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content;

        if (delta) {
          send({ data: delta });
        }
      }

      send({ event: 'complete', data: '' });
    })();

    return () => {};
  });
}
