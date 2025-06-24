interface ProfileAvatarProps {
  imageUrl?: string;
  name: string;
  size?: 'small' | 'medium' | 'large';
  showWaveform?: boolean;
  className?: string;
}

export function ProfileAvatar({
  imageUrl,
  name,
  size = 'large',
  showWaveform = true,
  className,
}: ProfileAvatarProps) {
  return (
    <div className={`relative ${getSizeClasses(size)} ${className}`}>
      {/* Waveform background pattern */}
      {showWaveform && (
        <div className="absolute inset-0 rounded-full opacity-30">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#waveformGradient)"
              strokeWidth="2"
              strokeDasharray="4 2"
              className="animate-spin-slow"
            />
            <circle
              cx="50"
              cy="50"
              r="35"
              fill="none"
              stroke="url(#waveformGradient)"
              strokeWidth="1.5"
              strokeDasharray="2 3"
              className="animate-spin-reverse"
            />
            <defs>
              <linearGradient
                id="waveformGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}

      {/* Avatar image or initials */}
      <div className="relative z-10 w-full h-full rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white font-semibold text-2xl">
            {name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}

function getSizeClasses(size: 'small' | 'medium' | 'large') {
  switch (size) {
    case 'small':
      return 'w-16 h-16';
    case 'medium':
      return 'w-24 h-24';
    case 'large':
      return 'w-32 h-32';
  }
}
