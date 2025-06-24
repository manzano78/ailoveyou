import { StatusIndicator } from '~/modules/profile-capture/components/conversation/status-indicator';
import { Header } from '~/modules/profile-capture/components/conversation/header';
import { RecordingController } from '~/modules/profile-capture/components/conversation/recording-controller';
import { Waveform } from '~/modules/profile-capture/components/conversation/wave-form';
import { Prompt } from '~/modules/profile-capture/components/conversation/prompt';
import { useConversation } from '~/modules/profile-capture/hooks/useConversation';
import { useAudioRecorder } from '~/hooks/useAudioRecorder';
import './conversation.css';
import { href } from 'react-router';
import { SpeakerIcon } from '~/modules/profile-capture/components/conversation/speaker-icon';
import { useRef } from 'react';

export function Conversation() {
  const { isUsersTurn, postUsersAnswer, botQuestion, stopRecording } =
    useConversation();
  const audioElRef = useRef<HTMLAudioElement>(null);

  const {
    startRecording,
    stopRecording: stopAudioRecording,
    isRecording,
  } = useAudioRecorder(postUsersAnswer);

  // Handle stopping recording from conversation logic
  const handleStopRecording = () => {
    stopAudioRecording();
    stopRecording();
  };

  return (
    <div className="container">
      <StatusIndicator />
      <Header />
      <RecordingController
        isRecording={isRecording}
        onStartRecording={startRecording}
        onStopRecording={handleStopRecording}
      />
      {isRecording && <Waveform />}
      <Prompt value={botQuestion} />
      {isUsersTurn && botQuestion && (
        <>
          <div
            className="flex justify-center"
            onClick={() => audioElRef.current?.play()}
          >
            <SpeakerIcon />
          </div>
          <audio
            ref={audioElRef}
            src={href('/profile-capture/get-audio/:text', {
              text: botQuestion,
            })}
          />
        </>
      )}
    </div>
  );
}
