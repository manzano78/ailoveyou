import type { PersonalityTrait } from '~/infra/match/types';

interface PersonalityTraitsProps {
  traits: PersonalityTrait[];
}

export function PersonalityTraits({ traits }: PersonalityTraitsProps) {
  const TraitItem = ({ trait }: { trait: PersonalityTrait }) => (
    <div className="flex items-center gap-2">
      <span className="text-2xl">{trait.emoji}</span>
      <span className="text-white text-base font-medium">{trait.label}</span>
    </div>
  );

  return (
    <div className="grid grid-cols-2 grid-rows-3 gap-x-2 gap-y-2 max-w-[300px] mx-auto">
      {traits.map((trait) => (
        <TraitItem key={trait.id} trait={trait} />
      ))}
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
