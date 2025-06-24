import { useEffect, useState } from 'react';
import './discovery-animation.css';

interface DiscoveryAnimationProps {
  onDiscoveryComplete: () => void;
  duration?: number; // in milliseconds
}

export function DiscoveryAnimation({
  onDiscoveryComplete,
  duration = 5000,
}: DiscoveryAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [showResonanceFound, setShowResonanceFound] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = Math.min(prev + 2, 100);
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setShowResonanceFound(true);
            setTimeout(() => {
              onDiscoveryComplete();
            }, 2000);
          }, 500);
        }
        return newProgress;
      });
    }, duration / 50);

    return () => clearInterval(interval);
  }, [duration, onDiscoveryComplete]);

  return (
    <div className="text-white relative overflow-hidden h-full">
      {/* Floating Dots */}
      <div className="absolute inset-0">
        {/* Orange dots */}
        <div
          className="floating-dot floating-dot-orange"
          style={{ top: '20%', left: '15%', animationDelay: '0s' }}
        />
        <div
          className="floating-dot floating-dot-orange"
          style={{ top: '60%', left: '25%', animationDelay: '2s' }}
        />
        <div
          className="floating-dot floating-dot-orange"
          style={{ top: '80%', left: '70%', animationDelay: '4s' }}
        />
        <div
          className="floating-dot floating-dot-orange"
          style={{ top: '40%', right: '20%', animationDelay: '1s' }}
        />

        {/* Gray dots */}
        <div
          className="floating-dot floating-dot-gray"
          style={{ top: '30%', left: '35%', animationDelay: '3s' }}
        />
        <div
          className="floating-dot floating-dot-gray"
          style={{ top: '70%', right: '15%', animationDelay: '5s' }}
        />
        <div
          className="floating-dot floating-dot-gray"
          style={{ top: '15%', right: '40%', animationDelay: '1.5s' }}
        />
        <div
          className="floating-dot floating-dot-gray"
          style={{ bottom: '20%', left: '45%', animationDelay: '3.5s' }}
        />
      </div>

      {/* Connection Lines */}
      <div className="connection-lines">
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <radialGradient id="connectionGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
            </radialGradient>
          </defs>
          {/* Swirling connection lines */}
          <path
            d="M200,300 Q400,100 600,300 Q800,500 1000,300"
            stroke="url(#connectionGradient)"
            strokeWidth="2"
            fill="none"
            className="connection-path"
          />
          <path
            d="M100,200 Q300,400 500,200 Q700,50 900,200"
            stroke="url(#connectionGradient)"
            strokeWidth="1.5"
            fill="none"
            className="connection-path"
            style={{ animationDelay: '1s' }}
          />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full p-4">
        {!showResonanceFound ? (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-5xl font-thin mb-3">Resonance</h1>
              <p className="text-gray-400 text-lg">Your agent is mingling...</p>
            </div>

            {/* Central Swirl */}
            <div className="mb-12">
              <div className="swirl-container">
                <div className="swirl-element swirl-1" />
                <div className="swirl-element swirl-2" />
                <div className="swirl-element swirl-3" />
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-3 text-center">
              <div className="flex justify-between items-center w-64">
                <span className="text-gray-400">Agents Met</span>
                <span className="text-blue-400 text-2xl font-light">447</span>
              </div>
              <div className="flex justify-between items-center w-64">
                <span className="text-gray-400">Conversations</span>
                <span className="text-blue-400 text-2xl font-light">1843</span>
              </div>
              <div className="flex justify-between items-center w-64">
                <span className="text-gray-400">Resonance Found</span>
                <span className="text-blue-400 text-2xl font-light">1</span>
              </div>
            </div>
          </>
        ) : (
          /* Deep Resonance Found Modal */
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-8 max-w-sm w-full text-center">
            <h2 className="text-2xl font-medium text-white mb-2">
              Deep Resonance
              <br />
              Found!
            </h2>
            <div className="text-5xl font-light text-white">87%</div>
          </div>
        )}
      </div>
    </div>
  );
}
