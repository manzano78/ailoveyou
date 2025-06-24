import type { Route } from './+types/get-audio';

export async function loader({ params }: Route.LoaderArgs) {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    body: JSON.stringify({
      model: 'tts-1',
      input: params.text,
      voice: 'echo',
      response_format: 'mp3',
    }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Response('Failed to generate speech', {
      status: response.status,
    });
  }

  // Clone and forward the response properly
  const audioBuffer = await response.arrayBuffer();
  return new Response(audioBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Length': String(audioBuffer.byteLength),
    },
  });
}
