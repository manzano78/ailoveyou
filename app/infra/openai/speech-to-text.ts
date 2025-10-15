import { openAI } from '~/infra/openai/client';
import ffmpeg from 'fluent-ffmpeg';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writeFile, readFile } from 'node:fs/promises';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

// Tell fluent-ffmpeg where ffmpeg is
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export async function convertAudioFileToOpenAI(inputFile: File): Promise<File> {
  const inputPath = join(tmpdir(), `input-${Date.now()}.tmp`);
  const outputPath = join(tmpdir(), `output-${Date.now()}.wav`);

  await writeFile(inputPath, Buffer.from(await inputFile.arrayBuffer()));

  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .audioCodec('pcm_s16le') // PCM 16-bit
      .audioChannels(1) // mono
      .audioFrequency(16000) // 16kHz sample rate
      .outputOptions(['-vn'])
      .toFormat('wav')
      .save(outputPath)
      .on('end', () => resolve())
      .on('error', reject);
  });

  const data = await readFile(outputPath);
  return new File([new Uint8Array(data)], `converted.wav`, {
    type: 'audio/wav',
  });
}

export async function speechToText(
  audioFile: File,
  language?: string,
): Promise<string> {
  const { text } = await openAI.audio.transcriptions.create({
    file: await convertAudioFileToOpenAI(audioFile),
    model: 'gpt-4o-transcribe',
    response_format: 'json', // default is JSON, can be 'text', 'srt', etc.
    language,
  });

  return text;
}
