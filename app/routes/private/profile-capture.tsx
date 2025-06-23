import React, { useState, useEffect } from 'react';
import './profile-capture.css'; // Assuming you'll move the CSS here

const StatusIndicator = () => (
  <div className="status">
    <div className="status-dot"></div>
    <span className="status-text">Recording</span>
  </div>
);

const Header = () => (
  <div className="header">
    <div className="title">Resonance</div>
    <div className="subtitle">Let's capture your essence</div>
  </div>
);

const MicIcon = () => (
  <div className="mic-icon">
    <svg viewBox="0 0 24 24">
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
    </svg>
  </div>
);

const VoiceVisualizer = () => (
  <div className="voice-visualizer">
    <div className="voice-circle"></div>
    <div className="voice-circle"></div>
    <div className="voice-circle"></div>
    <MicIcon />
  </div>
);

const Waveform = () => (
  <div className="waveform">
    {[...Array(12)].map((_, i) => (
      <div
        key={i}
        className="wave-bar"
        style={{ animationDelay: `${i * 0.1}s` }}
      ></div>
    ))}
  </div>
);

const Prompt = () => {
  const [promptText, setPromptText] = useState(
    'Tell me about your perfect weekend...',
  );
  const prompts = [
    'Tell me about your perfect weekend...',
    'What brings you unexpected joy?',
    'Describe a moment you felt understood...',
  ];

  useEffect(() => {
    let promptIndex = 0;
    const interval = setInterval(() => {
      promptIndex = (promptIndex + 1) % prompts.length;
      setPromptText(prompts[promptIndex]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="prompt">
      <p className="prompt-text">{promptText}</p>
    </div>
  );
};

const Timer = () => {
  const [seconds, setSeconds] = useState(42);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prevSeconds) => prevSeconds + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const formattedTime = `${mins}:${secs.toString().padStart(2, '0')}`;

  return <div className="timer">{formattedTime}</div>;
};

export default function ProfileCaptureRoute() {
  return (
    <div className="parent-container">
      <div className="container">
        <StatusIndicator />
        <Header />
        <VoiceVisualizer />
        <Waveform />
        <Prompt />
        <Timer />
      </div>
    </div>
  );
}
