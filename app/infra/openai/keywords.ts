import { openAI } from '~/infra/openai/client';

interface Keyword {
  word: string;
  emoji: string;
}

function extractJson(apiResponseString: string) {
  // La regex pour capturer le contenu JSON entre les balises ```json et ```
  // Notez l'utilisation de `(?<jsonContent>...)` pour un groupe de capture nommé.
  const regex = /```json\s*(?<jsonContent>\[[\s\S]*?\])\s*```/;

  const match = apiResponseString.match(regex);

  if (match && match.groups && match.groups.jsonContent) {
    const jsonString = match.groups.jsonContent;

    try {
      // Parse the extracted JSON string into a JavaScript object
      const jsonObject = JSON.parse(jsonString);
      return jsonObject;
    } catch (e) {
      console.error('Error parsing JSON:', e);
    }
  } else {
    console.log('No JSON block found.');
  }
}

export async function getKeywords(transcript: string): Promise<Keyword[]> {
  const { choices } = await openAI.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' }, // Optional: Define the assistant's persona
      {
        role: 'user',
        content: `From this transcription of a user profile description for an AI-powered dating app, I would like you to extract 6 keywords with an associated emoji that correspond to the person in JSON format [{word:"", emoji: ""}] I only need the JSON array as output and nothing else \n\n transcript ${transcript}`,
      }, // The user's actual prompt
    ],
    temperature: 0.7, // Controls randomness. Lower is more deterministic.
    max_tokens: 150, // Maximum length of the response
  });

  const content = choices[0]?.message?.content || '';

  return extractJson(content);
}
