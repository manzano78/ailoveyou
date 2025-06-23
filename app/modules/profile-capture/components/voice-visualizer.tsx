import React from 'react';

import { MicIcon } from '~/modules/profile-capture/components/mic-icon';

export const VoiceVisualizer = () => (
  <div className="voice-visualizer">
    <div className="voice-circle"></div>
    <div className="voice-circle"></div>
    <div className="voice-circle"></div>
    <MicIcon />
  </div>
);
