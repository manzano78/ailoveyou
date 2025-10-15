import { openAI } from '~/infra/openai/client';
import ffmpeg from 'fluent-ffmpeg';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writeFile, readFile } from 'node:fs/promises';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

// Tell fluent-ffmpeg where ffmpeg is
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

async function convertAudioFile(inputFile: File): Promise<File> {
  const inputPath = join(tmpdir(), `input-${Date.now()}.tmp`);
  const wavPath = join(tmpdir(), `normalized-${Date.now()}.wav`);
  const outputPath = join(tmpdir(), `output-${Date.now()}.webm`);

  await writeFile(inputPath, Buffer.from(await inputFile.arrayBuffer()));

  // 1️⃣ Decode + normalize input → WAV PCM16 mono 48kHz
  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .audioCodec('pcm_s16le') // PCM 16-bit
      .audioChannels(1) // mono
      .audioFrequency(48000) // 48kHz
      .outputOptions(['-vn'])
      .toFormat('wav')
      .save(wavPath)
      .on('end', () => resolve())
      .on('error', reject);
  });

  // 2️⃣ Encode WAV → WebM/Opus
  await new Promise<void>((resolve, reject) => {
    ffmpeg(wavPath)
      .audioCodec('libopus')
      .audioChannels(1)
      .audioFrequency(48000)
      .outputOptions(['-b:a 64k', '-vn'])
      .toFormat('webm')
      .save(outputPath)
      .on('end', () => resolve())
      .on('error', reject);
  });

  const data = await readFile(outputPath);
  return new File([new Uint8Array(data)], 'converted.webm', {
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
