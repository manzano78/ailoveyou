import React from 'react';

import { MicIcon } from '~/modules/profile-capture/components/conversation/mic-icon';

interface VoiceVisualizerProps {
  stopRecording: () => void;
}

export const VoiceVisualizer = ({ stopRecording }: VoiceVisualizerProps) => (
  <div className="voice-visualizer" onClick={stopRecording}>
    <div className="voice-circle"></div>
    <div className="voice-circle"></div>
    <div className="voice-circle"></div>
    <MicIcon />
  </div>
);
