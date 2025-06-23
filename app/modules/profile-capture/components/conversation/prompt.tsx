interface PromptProps {
  value: string;
}

export const Prompt = ({ value }: PromptProps) => {
  return (
    <div className="prompt">
      <p className="prompt-text">{value || '...'}</p>
    </div>
  );
};
