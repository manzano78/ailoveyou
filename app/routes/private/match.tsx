import { useParams, useLoaderData } from 'react-router';
import { useState } from 'react';
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
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-light mb-2 text-gray-300">Match</h1>
          <h2 className="text-4xl font-medium">{matchUser.username}</h2>
        </div>

        {/* Voice Clips Row */}
        <div className="flex justify-center gap-8 mb-16">
          {voiceClips.slice(0, 3).map((clip: AudioClip, index: number) => (
            <VoiceClipPlayer
              key={clip.id}
              audioUrl={clip.url}
              isPlaying={playingClip === clip.id}
              onPlay={() => handlePlay(clip.id)}
              onPause={handlePause}
              progress={getProgress(clip.id)}
              size="large"
            />
          ))}
        </div>

        {/* Personality Traits */}
        <div className="mb-16">
          <PersonalityTraits traits={personalityTraits} />
        </div>

        {/* Ice Breaker Section */}
        <div className="mb-8">
          <IceBreaker
            question={iceBreaker.question}
            answers={iceBreaker.answers}
            onAnswerSelect={handleAnswerSelect}
            selectedAnswer={selectedAnswer}
          />
        </div>
      </div>
    </div>
  );
}
