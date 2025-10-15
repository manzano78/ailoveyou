import { openAI } from '~/infra/openai/client';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

/**
 * Converts an input audio File into a supported format (default: .webm with Opus codec).
 *
 * Works in Node.js and serverless environments (Cloudflare, Vercel, etc.)
 * using WebAssembly-based ffmpeg.
 *
 * @param inputFile - The original audio file (e.g., from request.formData()).
 * @returns A Promise that resolves to a new File in the converted format.
 */
export async function convertAudioFile(inputFile: File): Promise<File> {
  const ffmpeg = new FFmpeg();
  await ffmpeg.load();

  const inputName = `input.${inputFile.name.split('.').pop() || 'dat'}`;
  const outputName = 'output.webm';

  // Write input file into FFmpeg’s virtual FS
  await ffmpeg.writeFile(inputName, await fetchFile(inputFile));

  // Convert audio — here: re-encode to Opus/WebM (fast + OpenAI-friendly)
  await ffmpeg.exec(['-i', inputName, '-c:a', 'libopus', outputName]);

  // Read output from FFmpeg FS
  const fileData = await ffmpeg.readFile(outputName);

  // Convert FileData to Blob
  const uint8 = new Uint8Array(fileData as Uint8Array);
  const blob = new Blob([uint8], { type: 'audio/webm' });

  // Return as File
  return new File([blob], 'converted.webm', {
    type: 'audio/webm',
  });
}

export async function speechToText(
  audioFile: File,
  language?: string,
): Promise<string> {
  const { text } = await openAI.audio.transcriptions.create({
    file: await convertAudioFile(audioFile),
    model: 'gpt-4o-transcribe',
    response_format: 'json', // default is JSON, can be 'text', 'srt', etc.
    language,
  });

  return text;
}
