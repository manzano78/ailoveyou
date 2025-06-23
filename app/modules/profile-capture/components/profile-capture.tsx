import { StatusIndicator } from '~/modules/profile-capture/components/status-indicator';
import { Header } from '~/modules/profile-capture/components/header';
import { VoiceVisualizer } from '~/modules/profile-capture/components/voice-visualizer';
import { Waveform } from '~/modules/profile-capture/components/wave-form';
import { Prompt } from '~/modules/profile-capture/components/prompt';
import { Timer } from '~/modules/profile-capture/components/timer';
import React from 'react';
import './profile-capture.css';

export function ProfileCapture() {
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
