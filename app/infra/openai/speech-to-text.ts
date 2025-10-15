import { openAI } from '~/infra/openai/client';
import ffmpeg from 'fluent-ffmpeg';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writeFile, readFile } from 'node:fs/promises';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import decode from 'audio-decode';
import toWav from 'audiobuffer-to-wav';
// @ts-ignore
import { AudioContext } from 'web-audio-api';

// Tell fluent-ffmpeg where ffmpeg is
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export async function convertAudioFileToWebM(inputFile: File): Promise<File> {
  const inputPath = join(tmpdir(), `input-${Date.now()}.tmp`);
  const wavPath = join(tmpdir(), `normalized-${Date.now()}.wav`);
  const outputPath = join(tmpdir(), `output-${Date.now()}.webm`);

  // 1️⃣ Write input file to temp
  await writeFile(inputPath, Buffer.from(await inputFile.arrayBuffer()));

  // 2️⃣ Decode to AudioBuffer
  const audioBuffer = await decode(Buffer.from(await inputFile.arrayBuffer()));

  // 3️⃣ Normalize to mono
  const context = new AudioContext({ sampleRate: 48000 });
  let monoBuffer: AudioBuffer;

  if (audioBuffer.numberOfChannels > 1) {
    monoBuffer = context.createBuffer(
      1,
      audioBuffer.length,
      audioBuffer.sampleRate,
    );
    const channelData = monoBuffer.getChannelData(0);
    const channels = Array.from(
      { length: audioBuffer.numberOfChannels },
      (_, i) => audioBuffer.getChannelData(i),
    );
    for (let i = 0; i < audioBuffer.length; i++) {
      channelData[i] =
        channels.reduce((sum, ch) => sum + ch[i], 0) / channels.length;
    }
  } else {
    monoBuffer = audioBuffer;
  }

  // 4️⃣ Convert AudioBuffer to WAV
  const wavBuffer = toWav(monoBuffer, { float32: false });
  await writeFile(wavPath, Buffer.from(wavBuffer));

  // 5️⃣ Convert WAV → WebM/Opus
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

  // 6️⃣ Return WebM file
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
    file: await convertAudioFileToWebM(audioFile),
    model: 'gpt-4o-transcribe',
    response_format: 'json', // default is JSON, can be 'text', 'srt', etc.
    language,
  });

  return text;
}
