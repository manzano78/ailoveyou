import React from 'react';

export const Waveform = () => (
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
