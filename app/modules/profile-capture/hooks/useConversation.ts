import { href, useNavigation, useSubmit } from 'react-router';
import { useCallback, useEffect, useState } from 'react';
import { useTextStream } from '~/hooks/useTextStream';

export function useConversation({
  isLastQuestion,
}: {
  isLastQuestion: boolean;
}) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const [botQuestion, getBotQuestion, resetBotQuestion] = useTextStream(
    href('/profile-capture/conversation-message'),
  );
  const [isUsersTurn, setIsUsersTurn] = useState(false);
  const isPostingUsersAnswer =
    navigation.formAction === href('/profile-capture/conversation');
  const isProcessingProfileSummary = isPostingUsersAnswer && isLastQuestion;

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
