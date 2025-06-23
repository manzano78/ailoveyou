import { useRef, useEffect, useState } from 'react';
import clsx from 'clsx';
import { Spinner } from '~/components/spinner/spinner';
import { Waveform } from '~/modules/profile-capture/components/conversation/wave-form';

interface VoiceClipPlayerProps {
  audioUrl: string;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  progress: number; // 0-100
  size?: 'small' | 'medium' | 'large';
  simulatePlayback?: boolean; // New prop to enable simulation
  simulationDuration?: number; // Duration in milliseconds (default 5000ms)
}

export function VoiceClipPlayer({
  audioUrl,
  isPlaying,
  onPlay,
  onPause,
  progress,
  size = 'medium',
  simulatePlayback = true, // Default to true for testing
  simulationDuration = 5000, // 5 seconds default
}: VoiceClipPlayerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [simulatedProgress, setSimulatedProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Simulate loading for testing
  useEffect(() => {
    if (simulatePlayback) {
      setIsLoading(true);
      const loadTimeout = setTimeout(() => {
        setIsLoading(false);
        setIsLoaded(true);
      }, 1000); // Simulate 1 second loading time

      return () => clearTimeout(loadTimeout);
    }
  }, [simulatePlayback]);

  // Real audio loading (when not simulating)
  useEffect(() => {
    if (simulatePlayback) return;

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
  }, [audioUrl, simulatePlayback]);

  // Simulate playback progress
  useEffect(() => {
    if (!simulatePlayback || !isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start progress simulation
    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressPercent = Math.min(
        (elapsed / simulationDuration) * 100,
        100,
      );

      setSimulatedProgress(progressPercent);

      // Auto-pause when complete
      if (progressPercent >= 100) {
        onPause();
        setTimeout(() => setSimulatedProgress(0), 500); // Reset after short delay
      }
    }, 50); // Update every 50ms for smooth animation

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, simulatePlayback, simulationDuration, onPause]);

  // Reset simulated progress when not playing
  useEffect(() => {
    if (!isPlaying && simulatePlayback) {
      const resetTimeout = setTimeout(() => {
        setSimulatedProgress(0);
      }, 300);
      return () => clearTimeout(resetTimeout);
    }
  }, [isPlaying, simulatePlayback]);

  const handleClick = () => {
    if (isLoading || !isLoaded) return;

    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  // Use simulated progress when simulating, otherwise use prop
  const currentProgress = simulatePlayback ? simulatedProgress : progress;
  const circumference = 2 * Math.PI * 45; // radius of 45 for the progress circle
  const strokeDasharray = `${(currentProgress / 100) * circumference} ${circumference}`;

  return (
    <div className="relative">
      {!simulatePlayback && (
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
      )}

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

      {/* Play/Pause Button with Waveform */}
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
            {/* Waveform - always visible */}
            <div
              className={clsx(
                'absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none',
                isPlaying ? 'opacity-100' : 'opacity-30',
              )}
            >
              <div
                className="waveform-override"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  height: 'auto',
                  margin: '0',
                  opacity: '1',
                  animation: 'none',
                }}
              >
                <Waveform isPlaying={isPlaying} />
              </div>
            </div>

            {/* Play Icon - only visible when not playing */}
            {!isPlaying && (
              <div
                className={clsx(
                  'relative z-10 border-l-8 border-l-white border-t-4 border-t-transparent border-b-4 border-b-transparent ml-1',
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
