import { useParams, useLoaderData } from 'react-router';
import { useState } from 'react';
import { Container } from '~/components/container';
import { VoiceClipPlayer } from '~/components/audio/voice-clip-player';
import {
  PersonalityTraits,
  createMockPersonalityTraits,
} from '~/modules/profile/components/personality-traits';
import {
  IceBreaker,
  createMockIceBreaker,
} from '~/modules/match/components/ice-breaker';
import { MatchService } from '~/infra/match/match-service';
import type { MatchUser, AudioClip } from '~/infra/match/types';
import { Header } from '~/components/header';

interface LoaderData {
  userId: string;
  matches: MatchUser[];
  voiceClips: AudioClip[];
  personalityTraits: any[];
  iceBreaker: any;
}

export async function loader({ params }: { params: { userId: string } }) {
  const { userId } = params;

  if (!userId) {
    throw new Response('User ID is required', { status: 400 });
  }

  // Load match data (currently mock data)
  const matches = await MatchService.findMatches(userId);
  const voiceClips = await MatchService.getClipsForUser(userId);

  return {
    userId,
    matches,
    voiceClips,
    personalityTraits: createMockPersonalityTraits(),
    iceBreaker: createMockIceBreaker(),
  };
}

export default function MatchPage() {
  const { userId, matches, voiceClips, personalityTraits, iceBreaker } =
    useLoaderData<LoaderData>();
  const [playingClip, setPlayingClip] = useState<string | null>(null);
  const [clipProgress, setClipProgress] = useState<Record<string, number>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Audio management
  const handlePlay = (clipId: string) => {
    setPlayingClip(clipId);
    // TODO: Implement actual audio playback logic
  };

  const handlePause = () => {
    setPlayingClip(null);
    // TODO: Implement actual audio pause logic
  };

  const getProgress = (clipId: string) => {
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

  // Mock match user for display
  const matchUser: MatchUser = matches[0] || {
    id: userId,
    username: 'Username',
    nickname: 'Display Name',
    voiceClips: voiceClips,
    personalityTraits: personalityTraits,
    chemistryScore: 87,
    discoveryInsights: [],
  };

  return (
    <Container className="p-0">
      <div className="text-white flex flex-col h-full relative overflow-hidden">
        {/* Header */}
        <div className="mb-4 flex justify-center mt-10">
          <Header>{matchUser.username}</Header>
        </div>

        {/* Voice Clips Row */}
        <div className="flex flex-row flex-wrap justify-center items-center content-end gap-4 mb-8 rotate-180 max-w-[300px] mx-auto">
          {voiceClips.slice(0, 3).map((clip: AudioClip, index: number) => (
            <div key={clip.id} className="-rotate-180">
              <VoiceClipPlayer
                audioUrl={clip.url}
                isPlaying={playingClip === clip.id}
                onPlay={() => handlePlay(clip.id)}
                onPause={handlePause}
                progress={getProgress(clip.id)}
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
    </Container>
  );
}
