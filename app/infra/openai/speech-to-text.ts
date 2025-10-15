import { openAI } from '~/infra/openai/client';
import ffmpeg from 'fluent-ffmpeg';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writeFile, readFile } from 'node:fs/promises';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

// Tell fluent-ffmpeg where ffmpeg is
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export async function convertAudioFileToWebM(inputFile: File): Promise<File> {
  const inputPath = join(tmpdir(), `input-${Date.now()}.tmp`);
  const outputPath = join(tmpdir(), `output-${Date.now()}.webm`);

  await writeFile(inputPath, Buffer.from(await inputFile.arrayBuffer()));

  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .audioCodec('libopus') // Opus codec
      .audioChannels(1) // mono
      .audioFrequency(48000) // 48kHz sample rate
      .outputOptions(['-b:a 64k', '-vn']) // bitrate + drop any video
      .toFormat('webm')
      .save(outputPath)
      .on('end', () => resolve())
      .on('error', reject);
  });

  const data = await readFile(outputPath);
  return new File([new Uint8Array(data)], `converted.webm`, {
    type: 'audio/webm',
  });
}

export async function speechToText(
  audioFile: File,
  language?: string,
): Promise<string> {
  const { text } = await openAI.audio.transcriptions.create({
    file: await convertAudioFileToWebM(audioFile),
    model: 'gpt-4o-transcribe',
    response_format: 'json', // default is JSON, can be 'text', 'srt', etc.
    language,
  });

  return text;
}
