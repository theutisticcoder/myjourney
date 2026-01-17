'use server';

/**
 * @fileOverview A flow for summarizing workout session stats for the dashboard.
 *
 * - summarizeSessionForDashboard - A function that summarizes workout session stats.
 * - SummarizeSessionForDashboardInput - The input type for the summarizeSessionForDashboard function.
 * - SummarizeSessionForDashboardOutput - The return type for the summarizeSessionForDashboard function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import MistralClient from '@mistralai/mistralai';

const SummarizeSessionForDashboardInputSchema = z.object({
  speed: z.number().describe('The average speed of the workout session in MPH.'),
  distance: z.number().describe('The total distance covered during the workout session in miles.'),
  co2EmissionsSaved: z.number().describe('The amount of CO2 emissions saved during the workout session in kg.'),
});
export type SummarizeSessionForDashboardInput = z.infer<typeof SummarizeSessionForDashboardInputSchema>;

const SummarizeSessionForDashboardOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the workout session stats.'),
  progress: z.string().describe('A short, one-sentence summary of what has been generated.')
});
export type SummarizeSessionForDashboardOutput = z.infer<typeof SummarizeSessionForDashboardOutputSchema>;

export async function summarizeSessionForDashboard(input: SummarizeSessionForDashboardInput): Promise<SummarizeSessionForDashboardOutput> {
  return summarizeSessionForDashboardFlow(input);
}

const apiKey = process.env.MISTRAL_API_KEY;
if (!apiKey) {
  throw new Error('MISTRAL_API_KEY is not defined in the environment. Please set it in your .env file or hosting provider\'s environment variables.');
}
const mistralClient = new MistralClient(apiKey);

const summarizeSessionForDashboardFlow = ai.defineFlow(
  {
    name: 'summarizeSessionForDashboardFlow',
    inputSchema: SummarizeSessionForDashboardInputSchema,
    outputSchema: SummarizeSessionForDashboardOutputSchema,
  },
  async (input) => {
    const prompt = `Summarize the following workout session stats in a concise and informative way for a user dashboard:\n\nSpeed: ${input.speed} MPH\nDistance: ${input.distance} miles\nCO2 Emissions Saved: ${input.co2EmissionsSaved} kg

You MUST respond with a JSON object with one key: "summary", containing the concise summary.`;

    const chatResponse = await mistralClient.chat({
        model: 'mistral-large-latest',
        messages: [{ role: 'user', content: prompt }],
        responseFormat: { type: 'json_object' },
    });
    
    const content = chatResponse.choices[0].message.content;
    const output = JSON.parse(content);

    return {
      ...output,
      progress: 'Generated a summary of the workout session stats for the dashboard.'
    };
  }
);
