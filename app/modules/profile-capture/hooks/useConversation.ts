import { href, useFetcher } from 'react-router';
import { useEffect, useRef, useState } from 'react';

const MAX_CONVERSATION_LENGTH = 6;

export function useConversation(conversationLength: number) {
  const { submit, state } = useFetcher();
  const [botQuestion, setBotQuestion] = useState('');
  const [isUsersTurn, setIsUsersTurn] = useState(false);
  const isPostingUsersAnswer = state === 'submitting';
  const initialConversationLengthRef = useRef(conversationLength);
  const isFinished = conversationLength >= MAX_CONVERSATION_LENGTH;

  console.log({ conversationLength });

  const getNextQuestionRef = useRef(() => {
    setBotQuestion('');
    const sse = new EventSource(href('/profile-capture/conversation-message'));

    sse.addEventListener('message', (event) => {
      const { data: nextMessage } = event;

      if (nextMessage === '[DONE]') {
        sse.close();
        setIsUsersTurn(true);
      } else {
        setBotQuestion((prevBotMessage) => `${prevBotMessage}${nextMessage}`);
      }
    });

    sse.addEventListener('error', (event) => {
      console.log('error: ', event);
      sse.close();
    });
  });

  useEffect(() => {
    if (initialConversationLengthRef.current < MAX_CONVERSATION_LENGTH) {
      getNextQuestionRef.current();
    }
  }, []);

  const postUsersAnswer = async (audioPrompt: Blob) => {
    setBotQuestion('');
    setIsUsersTurn(false);

    const formData = new FormData();

    formData.set('audio-prompt', audioPrompt);
    formData.set('bot-question', botQuestion);

    await submit(formData, {
      method: 'post',
      encType: 'multipart/form-data',
      action: href('/profile-capture/conversation-message'),
    });

    getNextQuestionRef.current();
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
