import { StatusIndicator } from '~/modules/profile-capture/components/conversation/status-indicator';
import { Header } from '~/modules/profile-capture/components/conversation/header';
import { VoiceVisualizer } from '~/modules/profile-capture/components/conversation/voice-visualizer';
import { Waveform } from '~/modules/profile-capture/components/conversation/wave-form';
import { Prompt } from '~/modules/profile-capture/components/conversation/prompt';
import { Timer } from '~/modules/profile-capture/components/conversation/timer';
import React from 'react';
import './conversation.css';

export function Conversation() {
  return (
    <div className="container">
      <StatusIndicator />
      <Header />
      <VoiceVisualizer />
      <Waveform />
      <Prompt />
      <Timer />
    </div>
  );
}
