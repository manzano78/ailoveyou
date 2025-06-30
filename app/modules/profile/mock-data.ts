import type { ProfileSummaryData } from '~/infra/profile/types';

export function createMockProfileSummary(): ProfileSummaryData {
  return {
    name: 'Luna Chen',
    age: 28,
    location: 'San Francisco',
    core_values: ['authenticity', 'curiosity', 'kindness'],
    top_interests: ['handicrafts', 'reading', 'travel', 'cinema', 'community'],
    personality_style:
      'Open, creative and relational, advocating authenticity and sincerity. Loves to explore and establish meaningful connections.',
    voice_style:
      'Warm and dynamic, clearly and honestly expressing thoughts and emotions.',
    emotional_signature:
      'Balanced and expressive, with an ease in sharing emotions in an open and respectful way.',
    quotes: [
      'Stay curious, you need to be curious to understand the world around us.',
      "You have to be yourself, you shouldn't fade away or damage yourself for others.",
      'I love traveling and spending time with my friends.',
    ],
    summary:
      'With a strong appreciation for authenticity, curiosity and kindness, this person is both creative and social. She maintains benevolent relationships and expresses her emotions without reserve, always seeking enriching experiences that promote community and sharing. Passionate about arts and travel, she shows herself to be a fan of planning while cherishing moments of improvisation.',
  };
}
