import { MicIcon } from '~/modules/profile-capture/components/conversation/mic-icon';

interface RecordingControllerProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

const SquareIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);

export const RecordingController = ({
  isRecording,
  onStartRecording,
  onStopRecording,
}: RecordingControllerProps) => {
  const handleClick = () => {
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  };

  return (
    <div
      className={`voice-button ${isRecording ? 'voice-button--recording' : ''}`}
      onClick={handleClick}
    >
      <div className="voice-circle"></div>
      <div className="voice-circle"></div>
      <div className="voice-circle"></div>
      {isRecording ? <SquareIcon /> : <MicIcon />}
    </div>
  );
};
