import { useRef, useEffect, useState } from 'react';
import clsx from 'clsx';
import { Spinner } from '~/components/spinner/spinner';

interface VoiceClipPlayerProps {
  audioUrl: string;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  progress: number; // 0-100
  size?: 'small' | 'medium' | 'large';
}

export function VoiceClipPlayer({
  audioUrl,
  isPlaying,
  onPlay,
  onPause,
  progress,
  size = 'medium',
}: VoiceClipPlayerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32',
  };

  const iconSizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-10 h-10',
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => {
      setIsLoading(false);
      setIsLoaded(true);
    };
    const handleError = () => {
      setIsLoading(false);
      console.error('Error loading audio');
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [audioUrl]);

  const handleClick = () => {
    if (isLoading || !isLoaded) return;

    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  const circumference = 2 * Math.PI * 45; // radius of 45 for the progress circle
  const strokeDasharray = `${(progress / 100) * circumference} ${circumference}`;

  return (
    <div className="relative">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Progress Ring */}
      <svg
        className={clsx('absolute inset-0 -rotate-90', sizeClasses[size])}
        viewBox="0 0 100 100"
      >
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="2"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="2"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>

      {/* Play/Pause Button */}
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={clsx(
          'relative flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size],
        )}
      >
        {isLoading ? (
          <Spinner size="small" />
        ) : (
          <>
            {isPlaying ? (
              // Pause icon
              <div className={clsx('flex gap-1', iconSizeClasses[size])}>
                <div
                  className="w-1 bg-white rounded-full"
                  style={{ height: '60%' }}
                />
                <div
                  className="w-1 bg-white rounded-full"
                  style={{ height: '60%' }}
                />
              </div>
            ) : (
              // Play icon
              <div
                className={clsx(
                  'border-l-8 border-l-white border-t-4 border-t-transparent border-b-4 border-b-transparent ml-1',
                  {
                    'border-l-[6px] border-t-[3px] border-b-[3px]':
                      size === 'small',
                    'border-l-8 border-t-4 border-b-4': size === 'medium',
                    'border-l-10 border-t-5 border-b-5': size === 'large',
                  },
                )}
              />
            )}
          </>
        )}
      </button>
    </div>
  );
}
