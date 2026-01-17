'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating genre-specific stories.
 *
 * - generateGenreSpecificStory - A function that generates a story based on a selected genre and plot.
 * - GenerateGenreSpecificStoryInput - The input type for the generateGenreSpecificStory function.
 * - GenerateGenreSpecificStoryOutput - The return type for the generateGenreSpecificStory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import MistralClient from '@mistralai/mistralai';

const GenerateGenreSpecificStoryInputSchema = z.object({
  genre: z.string().describe('The genre of the story.'),
  plot: z.string().describe('A custom plot for the story.'),
  speedDescription: z.string().describe('The user activity description.'),
  existingStoryContext: z.string().optional().describe('The existing story context to continue from'),
});

export type GenerateGenreSpecificStoryInput = z.infer<typeof GenerateGenreSpecificStoryInputSchema>;

const GenerateGenreSpecificStoryOutputSchema = z.object({
  storyChapter: z.string().describe('A chapter of the story.'),
});

export type GenerateGenreSpecificStoryOutput = z.infer<typeof GenerateGenreSpecificStoryOutputSchema>;

export async function generateGenreSpecificStory(
  input: GenerateGenreSpecificStoryInput
): Promise<GenerateGenreSpecificStoryOutput> {
  return generateGenreSpecificStoryFlow(input);
}

const apiKey = process.env.MISTRAL_API_KEY;
if (!apiKey) {
  throw new Error('MISTRAL_API_KEY is not defined in the environment. Please set it in your .env file or hosting provider\'s environment variables.');
}
const mistralClient = new MistralClient(apiKey);

const generateGenreSpecificStoryFlow = ai.defineFlow(
  {
    name: 'generateGenreSpecificStoryFlow',
    inputSchema: GenerateGenreSpecificStoryInputSchema,
    outputSchema: GenerateGenreSpecificStoryOutputSchema,
  },
  async (input) => {
    const prompt = `You are a story writer who specializes in the ${input.genre} genre. Continue the story based on the following context: ${input.existingStoryContext || 'This is the beginning of the story.'}.

Craft a new chapter for the story with a compelling narrative, tailored to the user's activity: ${input.speedDescription}. The new chapter should be a long chapter (at least 20 paragraphs)). Write in second person.
Plot: ${input.plot}

You MUST respond with a JSON object with a single key "storyChapter" which contains the generated story chapter, a string.`;

    const chatResponse = await mistralClient.chat({
        model: 'mistral-large-latest',
        messages: [{ role: 'user', content: prompt }],
        responseFormat: { type: 'json_object' },
    });
    
    const content = chatResponse.choices[0].message.content;
    return JSON.parse(content);
  }
);
