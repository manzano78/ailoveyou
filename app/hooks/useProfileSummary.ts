import { useEffect, useMemo, useState } from 'react';
import { useTextStream } from '~/hooks/useTextStream';
import { href } from 'react-router';
import type { ProfileSummaryData } from '~/infra/profile/types';

export function useProfileSummary(): ProfileSummaryData | null {
  const [isDone, setIsDone] = useState(false);
  const [profileSummary, loadProfileSummary] = useTextStream(
    href('/profile-summary-stream'),
  );

  const jsonSummary = useMemo(() => {
    if (!isDone || !profileSummary) return null;

    try {
      const rawJson = profileSummary.slice(8, -4);
      const parsed = JSON.parse(rawJson);

      // Transform the streamed data into our ProfileSummaryData format
      return {
        name: 'Luna Chen', // TODO: Get from user session
        age: 28, // TODO: Get from profile
        location: 'Paris', // TODO: Get from profile
        core_values: parsed.core_values || [],
        top_interests: parsed.top_interests || [],
        personality_style: parsed.personality_style || '',
        voice_style: parsed.voice_style || '',
        emotional_signature: parsed.emotional_signature || '',
        quotes: parsed.quotes || [],
        summary: parsed.summary || '',
      } as ProfileSummaryData;
    } catch (error) {
      console.error('Failed to parse profile summary:', error);
      return null;
    }
  }, [profileSummary, isDone]);

  useEffect(() => {
    loadProfileSummary().then(() => setIsDone(true));
  }, [loadProfileSummary]);

  return jsonSummary;
}
