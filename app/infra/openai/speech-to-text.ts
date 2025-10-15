import { openAI } from '~/infra/openai/client';
import ffmpeg from 'fluent-ffmpeg';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writeFile, readFile } from 'node:fs/promises';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

// Tell fluent-ffmpeg where ffmpeg is
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

async function convertAudioFile(inputFile: File) {
  const inputPath = join(tmpdir(), `input-${Date.now()}.tmp`);
  const wavPath = join(tmpdir(), `output-${Date.now()}.wav`);

  // Write input file to temp
  await writeFile(inputPath, Buffer.from(await inputFile.arrayBuffer()));

  // Convert using ffmpeg
  await new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioCodec('pcm_s16le') // PCM 16-bit
      .audioChannels(1) // mono
      .audioFrequency(48000) // 48kHz
      .outputOptions(['-vn'])
      .toFormat('wav')
      .save(wavPath)
      .on('end', resolve)
      .on('error', reject);
  });

  // Return WAV file
  const data = await readFile(wavPath);
  return new File([new Uint8Array(data)], 'converted.wav', {
    type: 'audio/wav',
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
