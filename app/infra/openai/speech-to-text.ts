import { openAI } from '~/infra/openai/client';

export async function speechToText(audioFile: File): Promise<string> {
  const { text } = await openAI.audio.transcriptions.create({
    file: audioFile,
    model: 'gpt-4o-transcribe',
    response_format: 'json', // default is JSON, can be 'text', 'srt', etc.
    language: 'fr', // optional
  });

  return text;
}
