import { useProfileSummary } from '~/hooks/useProfileSummary';

export default function ProfileSummaryRoute() {
  const profileSummary = useProfileSummary();

  return (
    <div className="p-2">
      <p className="mb-8">Profile summary</p>
      <div className="whitespace-pre-line">
        {profileSummary
          ? JSON.stringify(profileSummary, null, 2)
          : 'Loading...'}
      </div>
    </div>
  );
}
