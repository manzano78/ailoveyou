import type { ProfileSummaryData } from '~/infra/profile/types';

export function createMockProfileSummary(): ProfileSummaryData {
  return {
    name: 'Luna Chen',
    age: 28,
    location: 'San Francisco',
    core_values: ['authenticité', 'curiosité', 'bienveillance'],
    top_interests: [
      'activités manuelles',
      'lecture',
      'voyages',
      'cinéma',
      'communauté',
    ],
    personality_style:
      "Ouverte, créative et relationnelle, prônant l'authenticité et la sincérité. Aime explorer et établir des connexions significatives.",
    voice_style:
      'Chaleureux et dynamique, exprimant clairement et honnêtement ses pensées et émotions.',
    emotional_signature:
      'Équilibrée et expressive, avec une aisance à partager ses émotions de façon ouverte et respectueuse.',
    quotes: [
      'Stay curious, il faut être curieux pour comprendre le monde qui nous entoure.',
      "Il faut être soi-même, qu'il faut pas s'effacer ou s'abîmer pour les autres.",
      "J'adore voyager et passer du temps avec mes amis.",
    ],
    summary:
      "Avec une forte appréciation pour l'authenticité, la curiosité et la bienveillance, cette personne est à la fois créative et sociale. Elle entretient des relations bienveillantes et exprime ses émotions sans réserve, toujours en recherchant des expériences enrichissantes qui favorisent la communauté et le partage. Passionnée par les arts et les voyages, elle se montre fan de planification tout en chérissant les moments d'improvisation.",
  };
}
