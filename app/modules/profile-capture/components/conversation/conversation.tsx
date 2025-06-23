import { StatusIndicator } from '~/modules/profile-capture/components/conversation/status-indicator';
import { Header } from '~/modules/profile-capture/components/conversation/header';
import { VoiceVisualizer } from '~/modules/profile-capture/components/conversation/voice-visualizer';
import { Waveform } from '~/modules/profile-capture/components/conversation/wave-form';
import { Prompt } from '~/modules/profile-capture/components/conversation/prompt';
import { Timer } from '~/modules/profile-capture/components/conversation/timer';
import { useConversation } from '~/modules/profile-capture/hooks/useConversation';
import { useAudioRecorder } from '~/hooks/useAudioRecorder';
import './conversation.css';

export function Conversation() {
  const { isUsersTurn, postUsersAnswer, botQuestion, stopRecording } =
    useConversation();
  useAudioRecorder(isUsersTurn, postUsersAnswer);

  return (
    <div className="container">
      <StatusIndicator />
      <Header />
      <VoiceVisualizer stopRecording={stopRecording} />
      {isUsersTurn && <Waveform />}
      <Prompt value={botQuestion} />
      <Timer />
    </div>
  );
}
