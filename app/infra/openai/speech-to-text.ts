import { openAI } from '~/infra/openai/client';
import ffmpeg from 'fluent-ffmpeg';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writeFile, readFile } from 'node:fs/promises';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

// Tell fluent-ffmpeg where ffmpeg is
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export async function convertAudioFile(
  inputFile: File,
  outputExt: 'webm' | 'wav' | 'mp3' = 'webm',
): Promise<File> {
  // Create temporary paths in memory-like tmp dir
  const inputPath = join(tmpdir(), `input-${Date.now()}.tmp`);
  const outputPath = join(tmpdir(), `output-${Date.now()}.${outputExt}`);

  // Write input file to temp file
  await writeFile(inputPath, Buffer.from(await inputFile.arrayBuffer()));

  // Run ffmpeg conversion
  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions(['-c:a libopus'])
      .toFormat(outputExt)
      .save(outputPath)
      .on('end', () => resolve())
      .on('error', reject);
  });

  // Read result and return as File
  const data = await readFile(outputPath);
  return new File([new Uint8Array(data)], `converted.${outputExt}`, {
    type: `audio/${outputExt}`,
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
