import { Suspense, use, useState } from 'react';
import { Container } from '~/components/container';
import { VoiceClipPlayer } from '~/components/audio/voice-clip-player';
import { PersonalityTraits } from '~/modules/profile/components/personality-traits';
import {
  IceBreaker,
  createMockIceBreaker,
} from '~/modules/match/components/ice-breaker';
import { Header } from '~/components/header';
import { ProfileService } from '~/infra/profile';
import { getKeywords } from '~/infra/openai/keywords';
import type { Route } from './+types/match';
import { Spinner } from '~/components/spinner';

export interface ProfileAudio {
  id: number;
  raw: string;
  audioUrl: string;
}

/**
 * Converts a hexadecimal string representation of audio data into a Data URL
 * suitable for an HTML <audio> element's src attribute.
 *
 * @param hexString The hexadecimal string representing the audio data (e.g., "\\x010203...").
 * @param mimeType The MIME type of the audio (e.g., 'audio/mpeg' for MP3, 'audio/wav', 'audio/ogg').
 * This is crucial for the browser to correctly interpret the audio format.
 * @returns A Promise that resolves with the Data URL string.
 */
async function getAudioDataURLFromHexString(
  hexString: string,
  mimeType: string,
): Promise<string> {
  // Remove the initial '\x' if it's present, as well as any other non-hex characters for safety.
  const cleanedHexString = hexString.startsWith('\\x')
    ? hexString.substring(2)
    : hexString;

  if (cleanedHexString.length % 2 !== 0) {
    throw new Error('Hex string length is not even. Invalid format.');
  }

  // Convert hexadecimal string to Uint8Array
  const byteArray = new Uint8Array(cleanedHexString.length / 2);
  for (let i = 0; i < cleanedHexString.length; i += 2) {
    byteArray[i / 2] = parseInt(cleanedHexString.substring(i, i + 2), 16);
  }

  // Convert the Uint8Array to a binary string, then to Base64.
  // This is a common and efficient way to prepare binary data for Base64 encoding.
  let binaryString = '';
  byteArray.forEach((byte: number) => {
    binaryString += String.fromCharCode(byte);
  });
  const base64String = btoa(binaryString);

  // Construct the Data URL
  return `data:${mimeType};base64,${base64String}`;
}

async function loadData(userId: string) {
  const profile = await ProfileService.findProfile(userId);

  const profileAudios: ProfileAudio[] =
    profile.answer?.map((a, index) => ({
      raw: a.user_answer_audio ? a.user_answer_audio : '',
      audioUrl: '',
      audioDuration: 0,
      id: index,
    })) || [];

  const [personalityTraits] = await Promise.all([
    getKeywords(profile.transcript),
    ...profileAudios.map(async (pa) => {
      pa.audioUrl = await getAudioDataURLFromHexString(pa.raw, 'audio/mpeg');
      pa.raw = '';
    }),
  ]);

  return {
    profile,
    profileAudios,
    personalityTraits,
    iceBreaker: createMockIceBreaker(),
  };
}

export async function loader({ params }: Route.LoaderArgs) {
  return {
    dataPromise: loadData(params.userId),
  };
}

export default function MatchPage({ loaderData }: Route.ComponentProps) {
  return (
    <Container className="p-0">
      <Suspense
        fallback={
          <>
            <div className="flex items-center justify-center h-full">
              <Spinner />
            </div>
            <title>Loading match...</title>
          </>
        }
      >
        <Match dataPromise={loaderData.dataPromise} />
      </Suspense>
    </Container>
  );
}

function Match({ dataPromise }: { dataPromise: ReturnType<typeof loadData> }) {
  const { profile, profileAudios, personalityTraits, iceBreaker } =
    use(dataPromise);
  const [playingClip, setPlayingClip] = useState<number>(-1);
  const [clipProgress, setClipProgress] = useState<Record<string, number>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Audio management
  const handlePlay = (clipId: number) => {
    setPlayingClip(clipId);
    // TODO: Implement actual audio playback logic
  };

  const handlePause = () => {
    setPlayingClip(-1);
    // TODO: Implement actual audio pause logic
  };

  const getProgress = (clipId: number) => {
    return clipProgress[clipId] || 0;
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const openDrawer = () => {
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <>
      <title>{profile.nickname}</title>
      <div className="text-white flex flex-col h-full relative overflow-hidden">
        {/* Header */}
        <div className="mb-4 flex justify-center mt-10">
          <Header>{profile.nickname}</Header>
        </div>

        {/* Voice Clips Row */}
        <div className="flex flex-row flex-wrap justify-center items-center content-end gap-4 mb-8 rotate-180 max-w-[300px] mx-auto">
          {profileAudios.slice(0, 3).map((audio) => (
            <div key={audio.id} className="-rotate-180">
              <VoiceClipPlayer
                audio={audio}
                isPlaying={playingClip === audio.id}
                onPlay={() => handlePlay(audio.id)}
                onPause={handlePause}
                progress={getProgress(audio.id)}
                size="medium"
              />
            </div>
          ))}
        </div>

        {/* Personality Traits */}
        <div className="mb-8 flex-1 min-h-0">
          <PersonalityTraits traits={personalityTraits} />
        </div>

        {/* Break the Ice Button */}
        <div className="flex justify-center mb-10">
          <button
            onClick={openDrawer}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-2xl transition-all duration-300 transform hover:scale-105"
          >
            💬 Break the Ice
          </button>
        </div>

        {/* Drawer Overlay */}
        {isDrawerOpen && (
          <div
            className="absolute inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeDrawer}
          />
        )}

        {/* Ice Breaker Drawer */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gray-800 rounded-t-3xl transform transition-transform duration-300 ease-in-out z-50 ${
            isDrawerOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ maxHeight: '80%' }}
        >
          <div className="p-6 h-full">
            {/* Drawer Handle */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-1 bg-gray-400 rounded-full" />
            </div>

            {/* Close Button */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium text-white">
                Start a Conversation
              </h3>
              <button
                onClick={closeDrawer}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* Ice Breaker Content */}
            <div
              className="overflow-y-auto"
              style={{ maxHeight: 'calc(100% - 120px)' }}
            >
              <IceBreaker
                question={iceBreaker.question}
                answers={iceBreaker.answers}
                onAnswerSelect={handleAnswerSelect}
                selectedAnswer={selectedAnswer}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
