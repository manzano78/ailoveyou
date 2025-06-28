import { useState } from 'react';
import { Container } from '~/components/container';
import { DiscoveryAnimation } from '~/modules/resonance/components/discovery-animation';
import { ResonanceResults } from '~/modules/resonance/components/resonance-results';

export default function ResonanceDiscoveryPage() {
  const [discoveryState, setDiscoveryState] = useState<
    'searching' | 'found' | 'results'
  >('searching');

  const handleDiscoveryComplete = () => {
    setDiscoveryState('results');
  };

  return (
    <Container>
      <title>Discovery</title>
      <div className="text-white relative h-full">
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
          />
        )}
      </div>
    </Container>
  );
}
