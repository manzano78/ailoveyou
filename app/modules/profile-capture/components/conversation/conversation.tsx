import { StatusIndicator } from '~/modules/profile-capture/components/conversation/status-indicator';
import { Header } from '~/modules/profile-capture/components/conversation/header';
import { RecordingController } from '~/modules/profile-capture/components/conversation/recording-controller';
import { Waveform } from '~/modules/profile-capture/components/conversation/wave-form';
import { Prompt } from '~/modules/profile-capture/components/conversation/prompt';
import { Timer } from '~/modules/profile-capture/components/conversation/timer';
import { useConversation } from '~/modules/profile-capture/hooks/useConversation';
import { useAudioRecorder } from '~/hooks/useAudioRecorder';
import './conversation.css';

export function Conversation() {
  const { isUsersTurn, postUsersAnswer, botQuestion, stopRecording } =
    useConversation();

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

  console.log(isRecording, isUsersTurn);

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
    </div>
  );
}
