import { openAI } from '~/infra/openai/client';

export async function speechToText(audioFile: File): Promise<string> {
  const { text } = await openAI.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
    response_format: 'json', // default is JSON, can be 'text', 'srt', etc.
    language: 'en', // optional
  });

  return text;
}
