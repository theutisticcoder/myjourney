'use server';

/**
 * @fileOverview A Genkit flow for text-to-speech generation using Microsoft Edge TTS.
 *
 * - textToSpeech - A function that converts text to speech.
 * - TextToSpeechInput - The input type for the textToSpeech function.
 * - TextToSpeechOutput - The return type for the textToSpeech function.
 */

import { EdgeTTS } from 'edge-tts-universal';
import { z } from 'genkit';

const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
  audioDataUri: z.string().describe("The generated audio as a data URI. Expected format: 'data:audio/mp3;base64,<encoded_data>'."),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  try {
    // Use a pleasant English voice - you can change this to any available voice
    // Common voices: 'en-US-AriaNeural', 'en-US-JennyNeural', 'en-US-GuyNeural', etc.
    const tts = new EdgeTTS(
      input.text,
      'en-US-AriaNeural', // Female voice with good quality
      {
        rate: '+0%',
        volume: '+0%',
        pitch: '+0Hz'
      }
    );

    const result = await tts.synthesize();
    
    if (!result.audio) {
      throw new Error('No audio data returned from Edge TTS.');
    }

    // Convert the Response-like audio object to a Buffer
    const audioBuffer = Buffer.from(await result.audio.arrayBuffer());

    if (audioBuffer.length === 0) {
      throw new Error('Generated audio buffer is empty.');
    }

    // Convert to base64 data URI (Edge TTS returns MP3 format)
    const base64Audio = audioBuffer.toString('base64');
    
    return {
      audioDataUri: 'data:audio/mp3;base64,' + base64Audio,
    };
  } catch (error) {
    // Re-throw with more context for better debugging
    if (error instanceof Error) {
      throw new Error(`TTS generation failed: ${error.message}`);
    }
    throw new Error(`TTS generation failed with unknown error: ${String(error)}`);
  }
}
