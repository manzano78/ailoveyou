import React, { useEffect, useState } from 'react';

export const Prompt = () => {
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
