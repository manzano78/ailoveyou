interface PromptProps {
  value: string;
  isProcessingProfileSummary: boolean;
}

export const Prompt = ({ value, isProcessingProfileSummary }: PromptProps) => {
  const handleClick = () => {
    const voices = speechSynthesis.getVoices();
    const englishVoice = voices.find((voice) => voice.lang.startsWith('en'));

    if (englishVoice) {
      const utterance = new SpeechSynthesisUtterance(value);
      utterance.voice = englishVoice;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="prompt" onClick={handleClick}>
      <p className="prompt-text">
        {isProcessingProfileSummary
          ? "Thank you so much, I have everything I need! I'm now generating your profile, this may take a few seconds..."
          : value || '...'}
      </p>
    </div>
  );
};
