import OpenAI from 'openai';
import invariant from 'tiny-invariant';

const { OPENAI_API_KEY } = process.env;

invariant(
  OPENAI_API_KEY,
  'process.env.OPENAI_API_KEY not found. Please provide it!',
);

export const openAI = new OpenAI({ apiKey: OPENAI_API_KEY });
