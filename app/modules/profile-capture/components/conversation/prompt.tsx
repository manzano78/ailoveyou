interface PromptProps {
  value: string;
}

export const Prompt = ({ value }: PromptProps) => {
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
      <p className="prompt-text">{value || '...'}</p>
    </div>
  );
};
