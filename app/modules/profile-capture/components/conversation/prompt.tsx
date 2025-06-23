import { useConversation } from '~/modules/profile-capture/hooks/useConversation';

export const Prompt = () => {
  const { botQuestion } = useConversation();

  return (
    <div className="prompt">
      <p className="prompt-text">{botQuestion || '...'}</p>
    </div>
  );
};
