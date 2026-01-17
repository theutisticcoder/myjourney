export interface Chapter {
  id: string;
  sessionId: string;
  chapterNumber: number;
  text: string;
  audioUrl?: string;
  createdAt: number;
}

export interface Session {
  id: string;
  userId: string;
  name: string;
  genre: string;
  plot: string;
  triggerType: 'time' | 'distance';
  isCarpoolMode: boolean;
  status: 'active' | 'paused' | 'ended';
  startTime: number;
  elapsedTime: number; // in seconds
  speed: number; // in MPH
  distance: number; // in miles
  isGenerating: boolean;
  nextChapterDistance: number;
}

// Client-side representation of a session with its chapters
export interface ClientSession extends Session {
  chapters: Chapter[];
}

export type View = 'setup' | 'active' | 'dashboard';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
