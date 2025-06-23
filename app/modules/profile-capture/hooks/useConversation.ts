import { href, useFetcher } from 'react-router';
import { useEffect, useRef, useState } from 'react';

export function useConversation() {
  const postUserResponseFetcher = useFetcher();
  const [botQuestion, setBotQuestion] = useState('');

  const getNextQuestionRef = useRef(() => {
    setBotQuestion('');
    const sse = new EventSource(
      href('/profile-capture/api/conversation-message'),
    );

    sse.addEventListener('message', (event) => {
      const { data: nextMessage } = event;

      if (nextMessage === '[DONE]') {
        sse.close();
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
    getNextQuestionRef.current();
  }, []);

  return {
    botQuestion,
  };
}
