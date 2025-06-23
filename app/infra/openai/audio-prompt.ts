import { openAI } from '~/infra/openai/client';
import { textPrompt } from '~/infra/openai/text-prompt';

export async function audioPrompt({
  abortSignal,
  instructions,
  input,
}: {
  instructions: string;
  input: File;
  abortSignal: AbortSignal;
}) {
  const transcription = await openAI.audio.transcriptions.create({
    file: input,
    model: 'whisper-1',
    response_format: 'json', // default is JSON, can be 'text', 'srt', etc.
    language: 'en', // optional
  });

  return textPrompt({
    abortSignal,
    instructions,
    input: transcription.text,
  });
}
