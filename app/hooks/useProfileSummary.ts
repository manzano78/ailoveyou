import { useEffect, useMemo, useState } from 'react';
import { useTextStream } from '~/hooks/useTextStream';
import { href } from 'react-router';

export function useProfileSummary() {
  const [isDone, setIsDone] = useState(false);
  const [profileSummary, loadProfileSummary] = useTextStream(
    href('/profile-summary-stream'),
  );
  const jsonSummary = useMemo(
    () => (isDone ? JSON.parse(profileSummary.slice(8, -4)) : null),
    [profileSummary, isDone],
  );

  useEffect(() => {
    loadProfileSummary().then(() => setIsDone(true));
  }, [loadProfileSummary]);

  return jsonSummary;
}
