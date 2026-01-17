'use server';

/**
 * @fileOverview Generates a story chapter that adapts to the user's speed and workout intensity.
 *
 * - generateAdaptiveStoryChapter - A function that generates a story chapter based on user input.
 * - GenerateAdaptiveStoryChapterInput - The input type for the generateAdaptiveStoryChapter function.
 * - GenerateAdaptiveStoryChapterOutput - The return type for the generateAdaptiveStoryChapter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import MistralClient from '@mistralai/mistralai';

const GenerateAdaptiveStoryChapterInputSchema = z.object({
  speedMph: z.number().describe("The user's speed in miles per hour."),
  distanceMiles: z.number().describe('The total distance traveled in miles.'),
  elapsedTimeMinutes: z.number().describe('The elapsed time in minutes since the workout started.'),
  storyContext: z.string().describe('The ongoing context of the story.'),
  genre: z.string().describe('The genre of the story.'),
  plot: z.string().optional().describe('The custom plot provided by the user, if any'),
  carpoolMode: z.boolean().describe('If the user is in carpool mode'),
});
export type GenerateAdaptiveStoryChapterInput = z.infer<typeof GenerateAdaptiveStoryChapterInputSchema>;

const GenerateAdaptiveStoryChapterOutputSchema = z.object({
  chapterText: z.string().describe('The generated text for the story chapter.'),
});
export type GenerateAdaptiveStoryChapterOutput = z.infer<typeof GenerateAdaptiveStoryChapterOutputSchema>;

export async function generateAdaptiveStoryChapter(
  input: GenerateAdaptiveStoryChapterInput
): Promise<GenerateAdaptiveStoryChapterOutput> {
  return generateAdaptiveStoryChapterFlow(input);
}

const mistralClient = new MistralClient(process.env.MISTRAL_API_KEY || '');

const generateAdaptiveStoryChapterFlow = ai.defineFlow(
  {
    name: 'generateAdaptiveStoryChapterFlow',
    inputSchema: GenerateAdaptiveStoryChapterInputSchema,
    outputSchema: GenerateAdaptiveStoryChapterOutputSchema,
  },
  async (input) => {
    const prompt = `You are a story writer specializing in writing immersive, second-person narratives.

    The user is on a fitness journey, and you will generate the next chapter of their story based on their workout intensity.
    Maintain strict second-person immersion and avoid any meta-references to exercise or metrics.

    The story should adapt to the user's speed:
    - If the speed is low (walking), focus on atmospheric descriptions and world-building.
    - If the speed is high (sprinting), focus on punchy, high-tension action.

    Here's the current story context: ${input.storyContext}

    The genre of the story is: ${input.genre}.

    Current speed: ${input.speedMph} MPH
    Total distance: ${input.distanceMiles} miles
    Elapsed time: ${input.elapsedTimeMinutes} minutes
    Plot: ${input.plot ? input.plot : 'No custom plot provided.'}

    Write a 5-7 paragraph chapter that continues the story. The story is in second person.
    The story should be unique and creative, and not repeat previous content.

    You MUST respond with a JSON object with a single key "chapterText" which contains the generated chapter text.`;

    const chatResponse = await mistralClient.chat({
      model: 'mistral-large-latest',
      messages: [{ role: 'user', content: prompt }],
      responseFormat: { type: 'json_object' },
    });

    const content = chatResponse.choices[0].message.content;
    return JSON.parse(content);
  }
);
