import './wave-form.css';

interface WaveformProps {
  isPlaying?: boolean;
}

export const Waveform = ({ isPlaying = true }: WaveformProps) => (
  <div
    className="waveform"
    style={{
      animationPlayState: isPlaying ? 'running' : 'paused',
    }}
  >
    {[...Array(12)].map((_, i) => (
      <div
        key={i}
        className="wave-bar"
        style={{
          animationDelay: `${i * 0.1}s`,
          animationPlayState: isPlaying ? 'running' : 'paused',
        }}
      ></div>
    ))}
  </div>
);
