import { useRef, useCallback, useState } from 'react';

export function useAudioRecorder(
  onEnd?: (audioPrompt: Blob) => void,
  onError?: (error: unknown) => void,
) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const handleEndRef = useRef(onEnd);
  const handleErrorRef = useRef(onError);
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingProcessStartedRef = useRef(false);

  handleEndRef.current = onEnd;
  handleErrorRef.current = onError;

  const startRecording = useCallback(async () => {
    if (isRecordingProcessStartedRef.current) {
      return;
    }

    isRecordingProcessStartedRef.current = true;

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
        const file = new File(audioChunks, 'audio.webm', {
          type: 'audio/webm',
        });

        setIsRecording(false);
        handleEndRef.current?.(file);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      setIsRecording(false);
      isRecordingProcessStartedRef.current = false;
      handleErrorRef.current?.(error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      isRecordingProcessStartedRef.current = false;
    }
  }, []);

  return {
    startRecording,
    stopRecording,
    isRecording,
  };
}
