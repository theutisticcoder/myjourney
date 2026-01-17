import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-session-for-dashboard.ts';
import '@/ai/flows/generate-genre-specific-story.ts';
import '@/ai/flows/generate-adaptive-story-chapter.ts';
import '@/ai/flows/text-to-speech.ts';
