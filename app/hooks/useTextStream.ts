import { useRef, useState } from 'react';

export function useTextStream(url: string) {
  const [text, setText] = useState('');

  const resetText = () => setText('');

  const { current: prompt } = useRef(async (): Promise<void> => {
    setText('');
    const sse = new EventSource(url);

    return new Promise<void>((resolve, reject) => {
      sse.addEventListener('message', (event) => {
        const { data: delta } = event;

        if (delta === '[DONE]') {
          sse.close();
          resolve();
        } else {
          setText((prevText) => `${prevText}${delta}`);
        }
      });

      sse.addEventListener('error', (event) => {
        sse.close();
        reject(event);
      });
    });
  });

  return [text, prompt, resetText] as const;
}
