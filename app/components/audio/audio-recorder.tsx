import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Spinner } from '~/components/spinner/spinner';
import clsx from 'clsx';

interface AudioRecorderProps {
  onEnd?: (blob: Blob) => void;
  completeNode?: ReactNode;
}

export function AudioRecorder({ onEnd, completeNode }: AudioRecorderProps) {
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'recording' | 'complete' | 'error'
  >('idle');
  const [error, setError] = useState<string | null>(null);
  const handleEndRef = useRef(onEnd);
  const canvasElementRef = useRef<HTMLCanvasElement>(null);
  const isUnmountedRef = useRef(false);
  const animationIdRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  handleEndRef.current = onEnd;

  const handleStopRecording = async () => {
    setStatus('complete');

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.stop();

      streamRef.current?.getTracks().forEach((track) => track.stop());

      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
      }

      if (
        audioContextRef.current &&
        audioContextRef.current.state !== 'closed'
      ) {
        await audioContextRef.current.close();
      }
    }
  };

  const handleStartRecording = async () => {
    try {
      setStatus('loading');

      // ACCESSING THE MICRO
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      if (isUnmountedRef.current) {
        return;
      }

      setStatus('recording');

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

      // ---- VISUALISATION ----
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(
        streamRef.current,
      );
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      // We now have access to the micro
      const { current: canvas } = canvasElementRef;
      const ctx = canvas?.getContext('2d');

      if (!canvas || !ctx) {
        return;
      }

      // ---- WAVE DRAWING ----
      const drawWaveform = () => {
        console.log(canvas.width);
        analyser.getByteTimeDomainData(dataArray);

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#00ff00';
        ctx.beginPath();

        const bufferLength = dataArray.length;
        const sliceWidth = canvas.width / bufferLength;

        for (let i = 0; i < bufferLength; i++) {
          const x = i * sliceWidth;
          const v = dataArray[i] / 128.0;
          const y = (v * canvas.height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();

        animationIdRef.current = requestAnimationFrame(drawWaveform);
      };

      drawWaveform();
    } catch (error) {
      if (isUnmountedRef.current) {
        return;
      }

      if (
        (error as { name?: string }).name === 'NotAllowedError' ||
        (error as { name?: string }).name === 'PermissionDeniedError'
      ) {
        setError('❌ Forbidden access to the microphone.');
      } else {
        setError('❌ An error occurred while reaching the microphone');
      }
      setStatus('error');
    }
  };

  useEffect(
    () => () => {
      isUnmountedRef.current = true;
    },
    [],
  );

  return (
    <div>
      <canvas
        ref={canvasElementRef}
        className={clsx({ hidden: status !== 'recording' })}
      />
      {status === 'idle' && (
        <button onClick={handleStartRecording}>Start</button>
      )}
      {status === 'loading' && <Spinner size="medium" />}
      {status === 'recording' && (
        <button onClick={handleStopRecording}>Stop</button>
      )}
      {status === 'error' && <div className="text-red-600">{error}</div>}
      {status === 'complete' && completeNode}
    </div>
  );
}
