import { href, useFetcher } from 'react-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTextStream } from '~/hooks/useTextStream';
import type { action } from '~/routes/private/profile-capture/conversation-message';

export function useConversation() {
  const { submit, state, data } = useFetcher<typeof action>();
  const [botQuestion, getBotQuestion, resetBotQuestion] = useTextStream(
    href('/profile-capture/conversation-message'),
  );
  const [isUsersTurn, setIsUsersTurn] = useState(false);
  const isPostingUsersAnswer = state === 'submitting';
  const isProcessingProfileSummary = isPostingUsersAnswer && !!data?.isLast;

  const getNextQuestion = useCallback(() => {
    getBotQuestion().then(() => setIsUsersTurn(true));
  }, [getBotQuestion]);

  useEffect(() => {
    getNextQuestion();
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
    isProcessingProfileSummary,
  };
}
