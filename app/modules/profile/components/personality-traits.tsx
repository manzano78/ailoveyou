import type { PersonalityTrait } from '~/infra/match/types';

interface PersonalityTraitsProps {
  traits: PersonalityTrait[];
}

export function PersonalityTraits({ traits }: PersonalityTraitsProps) {
  const primaryTraits = traits.filter((trait) => trait.category === 'primary');
  const secondaryTraits = traits.filter(
    (trait) => trait.category === 'secondary',
  );

  const TraitItem = ({ trait }: { trait: PersonalityTrait }) => (
    <div className="flex items-center gap-2 py-2">
      <span className="text-2xl">{trait.emoji}</span>
      <span className="text-white text-base font-medium">{trait.label}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Primary Traits */}
      {primaryTraits.length > 0 && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            {primaryTraits.map((trait) => (
              <TraitItem key={trait.id} trait={trait} />
            ))}
          </div>
        </div>
      )}

      {/* Secondary Traits */}
      {secondaryTraits.length > 0 && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            {secondaryTraits.map((trait) => (
              <TraitItem key={trait.id} trait={trait} />
            ))}
          </div>
        </div>
      )}

      {/* All traits in a single grid if no categorization */}
      {primaryTraits.length === 0 && secondaryTraits.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          {traits.map((trait) => (
            <TraitItem key={trait.id} trait={trait} />
          ))}
        </div>
      )}
    </div>
  );
}

// Helper function to create mock personality traits for testing
export function createMockPersonalityTraits(): PersonalityTrait[] {
  return [
    {
      id: '1',
      emoji: '⚡',
      label: 'Actif',
      category: 'primary',
    },
    {
      id: '2',
      emoji: '🤝',
      label: 'Sociable',
      category: 'primary',
    },
    {
      id: '3',
      emoji: '🧠',
      label: 'Curieux',
      category: 'primary',
    },
    {
      id: '4',
      emoji: '🗣️',
      label: 'Communicatif',
      category: 'primary',
    },
    {
      id: '5',
      emoji: '🎬',
      label: 'Créatif',
      category: 'secondary',
    },
    {
      id: '6',
      emoji: '🚀',
      label: 'Ambitieux',
      category: 'secondary',
    },
  ];
}
