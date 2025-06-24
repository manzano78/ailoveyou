import { href, Link } from 'react-router';

interface ResonanceResultsProps {
  chemistryScore: number;
  insights: string[];
  onCreateIntroduction: () => void;
  avatarIcons?: {
    left: string;
    center: string;
    right: string;
  };
}

export function ResonanceResults({
  chemistryScore,
  insights,
  onCreateIntroduction,
  avatarIcons = {
    left: '🎭', // Drama masks for emotional depth
    center: '✨', // Sparkles for connection
    right: '🎨', // Art palette for creativity
  },
}: ResonanceResultsProps) {
  return (
    <div className="text-white flex flex-col items-center justify-center p-4 h-full">
      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">
          YOUR AGENTS DISCOVERED
        </p>
        <h1 className="text-4xl font-light bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Deep Resonance
        </h1>
      </div>

      {/* Avatar Icons */}
      <div className="flex items-center justify-center gap-8 mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-2xl">
          {avatarIcons.left}
        </div>
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-xl relative">
          {avatarIcons.center}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 to-white/30 rounded-full animate-pulse" />
        </div>
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-2xl">
          {avatarIcons.right}
        </div>
      </div>

      {/* Chemistry Score */}
      <div className="text-center mb-8">
        <p className="text-gray-400 text-sm uppercase tracking-wider mb-3">
          CHEMISTRY SCORE
        </p>
        <div className="text-7xl font-light text-purple-400 mb-2">
          {chemistryScore}%
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-3 mb-8 max-w-md w-full">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center flex-shrink-0">
              {index === 0 && (
                <div className="w-4 h-4 rounded-full border-2 border-purple-400 flex items-center justify-center">
                  <div className="w-1 h-1 bg-purple-400 rounded-full" />
                </div>
              )}
              {index === 1 && (
                <div className="w-4 h-4 flex items-center justify-center">
                  <div className="w-3 h-3 border-2 border-purple-400 rounded-sm relative">
                    <div className="absolute inset-1 bg-purple-400/50 rounded-sm" />
                  </div>
                </div>
              )}
              {index === 2 && (
                <div className="w-4 h-4 flex items-center justify-center">
                  <div className="w-3 h-0.5 bg-purple-400 rounded-full" />
                  <div className="w-3 h-0.5 bg-purple-400 rounded-full ml-0.5" />
                </div>
              )}
            </div>
            <p className="text-white text-base">{insight}</p>
          </div>
        ))}
      </div>

      {/* Create Introduction Button */}
      <Link
        to={href('/matches')}
        reloadDocument
        className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-2xl transition-all duration-300 transform hover:scale-105"
      >
        See profile
      </Link>
    </div>
  );
}
