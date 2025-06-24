import { href, useFetcher } from 'react-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTextStream } from '~/hooks/useTextStream';

const MAX_CONVERSATION_LENGTH = 6;

export function useConversation(conversationLength: number) {
  const { submit, state } = useFetcher();
  const [botQuestion, getBotQuestion, resetBotQuestion] = useTextStream(
    href('/profile-capture/conversation-message'),
  );
  const [isUsersTurn, setIsUsersTurn] = useState(false);
  const isPostingUsersAnswer = state === 'submitting';
  const initialConversationLengthRef = useRef(conversationLength);
  const isFinished = conversationLength >= MAX_CONVERSATION_LENGTH;

  const getNextQuestion = useCallback(() => {
    getBotQuestion().then(() => setIsUsersTurn(true));
  }, [getBotQuestion]);

  useEffect(() => {
    if (initialConversationLengthRef.current < MAX_CONVERSATION_LENGTH) {
      getNextQuestion();
    }
  }, [getNextQuestion]);

  const postUsersAnswer = async (audioPrompt: Blob) => {
    resetBotQuestion();
    setIsUsersTurn(false);

    const formData = new FormData();

    formData.set('audio-prompt', audioPrompt);
    formData.set('bot-question', botQuestion);

    await submit(formData, {
      method: 'post',
      encType: 'multipart/form-data',
      action: href('/profile-capture/conversation-message'),
    });

    getNextQuestion();
  };

  const stopRecording = () => {
    setIsUsersTurn(false);
  };

  return {
    isUsersTurn,
    botQuestion,
    postUsersAnswer,
    isPostingUsersAnswer,
    stopRecording,
    isFinished,
  };
}
