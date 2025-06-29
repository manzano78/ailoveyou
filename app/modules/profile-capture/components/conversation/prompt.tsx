interface PromptProps {
  value: string;
  isProcessingProfileSummary: boolean;
}

export const Prompt = ({ value, isProcessingProfileSummary }: PromptProps) => {
  const handleClick = () => {
    const voices = speechSynthesis.getVoices();
    const frenchVoice = voices.find((voice) => voice.lang.startsWith('fr'));

    if (frenchVoice) {
      const utterance = new SpeechSynthesisUtterance(value);
      utterance.voice = frenchVoice;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="prompt" onClick={handleClick}>
      <p className="prompt-text">
        {isProcessingProfileSummary
          ? "Merci beaucoup, j'ai tout ce qu'il faut! Je génère maintenant ton profil, cela peut prendre quelques secondes..."
          : value || '...'}
      </p>
    </div>
  );
};
