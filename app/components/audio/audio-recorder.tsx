import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Spinner } from '~/components/spinner/spinner';
import clsx from 'clsx';

interface AudioRecorderProps {
  onEnd?: (blob: Blob) => void;
  completeNode?: ReactNode;
  mode?: 'default' | 'essence-capture';
  prompt?: string;
  maxDuration?: number; // in seconds
}

// Timer component for essence capture mode
function Timer({ seconds }: { seconds: number }) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    <div className="text-6xl font-light text-white mb-8 text-center">
      {minutes}:{remainingSeconds.toString().padStart(2, '0')}
    </div>
  );
}

// Recording status indicator
function RecordingStatus() {
  return (
    <div className="absolute top-4 right-4 flex items-center gap-2">
      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      <span className="text-gray-400 text-sm">Recording</span>
    </div>
  );
}

export function AudioRecorder({
  onEnd,
  completeNode,
  mode = 'default',
  prompt = 'Describe a moment you felt understood...',
  maxDuration = 300, // 5 minutes default
}: AudioRecorderProps) {
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'recording' | 'complete' | 'error'
  >('idle');
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const handleEndRef = useRef(onEnd);
  const canvasElementRef = useRef<HTMLCanvasElement>(null);
  const isUnmountedRef = useRef(false);
  const animationIdRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  handleEndRef.current = onEnd;

  // Timer effect for essence capture mode
  useEffect(() => {
    if (status === 'recording' && mode === 'essence-capture') {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= maxDuration) {
            handleStopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status, mode, maxDuration]);

  const handleStopRecording = async () => {
    setStatus('complete');

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

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
      setRecordingTime(0);

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
        analyser.getByteTimeDomainData(dataArray);

        if (mode === 'essence-capture') {
          // Enhanced waveform for essence capture
          ctx.fillStyle = '#1a1a1a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.lineWidth = 3;
          ctx.strokeStyle = '#8b5cf6';
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

          // Add glow effect
          ctx.shadowColor = '#8b5cf6';
          ctx.shadowBlur = 20;
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else {
          // Original waveform
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
        }

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
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    },
    [],
  );

  if (mode === 'essence-capture') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 relative">
        {/* Recording Status Indicator */}
        {status === 'recording' && <RecordingStatus />}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Resonance
          </h1>
          <p className="text-gray-400 text-lg">Let's capture your essence</p>
        </div>

        {/* Microphone Button */}
        <div className="mb-8">
          {status === 'idle' && (
            <button
              onClick={handleStartRecording}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <div className="w-12 h-12 text-white">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2s-2-.9-2-2V4c0-1.1.9-2 2-2zm5.3 6.7c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4l-1.9 1.9c.7 1.2 1.2 2.6 1.2 4.1 0 .6-.4 1-1 1s-1-.4-1-1c0-2.8-2.2-5-5-5s-5 2.2-5 5c0 .6-.4 1-1 1s-1-.4-1-1c0-1.5.5-2.9 1.2-4.1L3.3 10c-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0L12 16.9l7.3-8.2z" />
                </svg>
              </div>
            </button>
          )}
          {status === 'loading' && (
            <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center">
              <Spinner size="big" />
            </div>
          )}
          {status === 'recording' && (
            <button
              onClick={handleStopRecording}
              className="w-32 h-32 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all duration-200 shadow-lg"
            >
              <div className="w-8 h-8 bg-white rounded-sm"></div>
            </button>
          )}
        </div>

        {/* Waveform */}
        <canvas
          ref={canvasElementRef}
          width={400}
          height={100}
          className={clsx('mb-8 rounded-lg', {
            hidden: status !== 'recording',
            'border border-purple-500/30': status === 'recording',
          })}
        />

        {/* Prompt */}
        {status === 'recording' && (
          <div className="text-center mb-8 max-w-md">
            <p className="text-lg text-gray-300 leading-relaxed">{prompt}</p>
          </div>
        )}

        {/* Timer */}
        {status === 'recording' && <Timer seconds={recordingTime} />}

        {/* Error Display */}
        {status === 'error' && (
          <div className="text-red-400 text-center">{error}</div>
        )}

        {/* Complete State */}
        {status === 'complete' && completeNode}
      </div>
    );
  }

  // Default mode (original interface)
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
