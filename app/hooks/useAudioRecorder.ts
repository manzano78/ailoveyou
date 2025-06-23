import { useEffect, useRef } from 'react';

export function useAudioRecorder(
  isActive: boolean,
  onEnd?: (audioPrompt: Blob) => void,
  onError?: (error: unknown) => void,
) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const handleEndRef = useRef(onEnd);
  const handleErrorRef = useRef(onError);

  handleEndRef.current = onEnd;
  handleErrorRef.current = onError;

  useEffect(() => {
    if (isActive) {
      (async () => {
        try {
          streamRef.current = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });

          // ---- RECORDING ----
          const audioChunks: Blob[] = [];
          mediaRecorderRef.current = new MediaRecorder(streamRef.current);
          mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunks.push(event.data);
          };
          mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(audioChunks, { type: 'audio/webm' });

            handleEndRef.current?.(blob);
          };
          mediaRecorderRef.current.start();
        } catch (error) {
          handleErrorRef.current?.(error);
        }
      })();
    } else {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === 'recording'
      ) {
        mediaRecorderRef.current.stop();
        streamRef.current?.getTracks().forEach((track) => track.stop());
      }
    }
  }, [isActive]);
}
