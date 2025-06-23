import { useState } from 'react';
import { useNavigate } from 'react-router';
import { DiscoveryAnimation } from '~/modules/resonance/components/discovery-animation';
import { ResonanceResults } from '~/modules/resonance/components/resonance-results';

export default function ResonanceDiscoveryPage() {
  const [discoveryState, setDiscoveryState] = useState<
    'searching' | 'found' | 'results'
  >('searching');
  const navigate = useNavigate();

  const handleDiscoveryComplete = () => {
    setDiscoveryState('results');
  };

  const handleCreateIntroduction = () => {
    // Navigate to introduction creation or match page
    navigate('/match/testuser'); // TODO: Use actual matched user ID
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {discoveryState === 'searching' && (
        <DiscoveryAnimation onDiscoveryComplete={handleDiscoveryComplete} />
      )}

      {discoveryState === 'results' && (
        <ResonanceResults
          chemistryScore={87}
          insights={[
            'Both seek depth over surface',
            'Complementary energy patterns',
            'Natural conversation flow detected',
          ]}
          onCreateIntroduction={handleCreateIntroduction}
        />
      )}
    </div>
  );
}
