interface PersonalityTrait {
  word?: string;
  emoji: string;
  id?: string;
  label?: string;
  category?: string;
}

interface PersonalityTraitsProps {
  traits: PersonalityTrait[];
}

function capitalizeWords(str: string) {
  // Divise la chaîne en un tableau de mots.
  // La regex /\s+/ gère un ou plusieurs espaces entre les mots.
  const words = str.split(/\s+/);

  // Mappe chaque mot pour le transformer
  const capitalizedWords = words.map((word) => {
    if (word.length === 0) {
      return ''; // Gère les cas où il y a plusieurs espaces consécutifs (créant des chaînes vides)
    }
    // Prend la première lettre et la met en majuscule
    const firstLetter = word.substring(0, 1).toUpperCase();
    // Prend le reste du mot (à partir du deuxième caractère)
    const restOfWord = word.substring(1);
    // Combine les deux
    return firstLetter + restOfWord;
  });

  // Rejoint les mots capitalisés avec un seul espace entre eux.
  // Note: Si la chaîne originale avait plusieurs espaces, ceux-ci seront réduits à un seul.
  return capitalizedWords.join(' ');
}

export function PersonalityTraits({ traits }: PersonalityTraitsProps) {
  const TraitItem = ({ trait }: { trait: PersonalityTrait }) => (
    <div className="flex items-center gap-2">
      <span className="text-2xl">{trait.emoji}</span>
      <span className="text-white text-base font-medium">
        {capitalizeWords(trait.word!)}
      </span>
    </div>
  );

  return (
    <div className="grid grid-cols-2 grid-rows-3 gap-x-2 gap-y-2 max-w-[300px] mx-auto">
      {traits.map((trait, index) => (
        <TraitItem key={index} trait={trait} />
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
