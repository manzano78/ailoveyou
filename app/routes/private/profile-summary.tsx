import { useTextStream } from '~/hooks/useTextStream';
import { href } from 'react-router';
import { useEffect } from 'react';

export default function ProfileSummaryRoute() {
  const [profileSummary, loadProfileSummary] = useTextStream(
    href('/profile-summary-stream'),
  );

  useEffect(() => {
    loadProfileSummary();
  }, [loadProfileSummary]);
  return (
    <div className="p-2">
      <p className="mb-8">Profile summary</p>
      <div className="whitespace-pre-line">{profileSummary}</div>
    </div>
  );
}
