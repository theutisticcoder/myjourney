'use client';

import type { Session, View, Chapter, ClientSession } from '@/lib/types';
import { generateAdaptiveStoryChapter } from '@/ai/flows/generate-adaptive-story-chapter';
import { generateGenreSpecificStory } from '@/ai/flows/generate-genre-specific-story';
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  useCollection,
  useFirebase,
  useFirestore,
  useMemoFirebase,
  useUser,
} from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import {
  createChapter,
  createSession,
  deleteSession,
  updateSession as updateSessionInDb,
} from '@/firebase/data-actions';

const CHAPTER_TRIGGER_TIME = 600; // 10 minutes in seconds
const CHAPTER_TRIGGER_DISTANCE = 1; // 1 mile
const CARPOOL_TRIGGER_DISTANCE = 7; // miles

export interface SessionContextType {
  view: View;
  setView: (view: View) => void;
  session: ClientSession | null;
  savedSessions: Session[];
  startNewSession: (settings: {
    genre: string;
    plot: string;
    triggerType: 'time' | 'distance';
    isCarpoolMode: boolean;
  }) => void;
  resumeSession: (sessionId: string) => void;
  updateSession: (updates: Partial<Session>) => void;
  pauseSession: () => void;
  endSession: () => void;
  deleteSavedSession: (sessionId: string) => void;
}

export const SessionContext = createContext<SessionContextType | null>(null);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { toast } = useToast();
  const [view, setView] = useState<View>('setup');
  const { user } = useUser();
  const firestore = useFirestore();

  // State for the active session (with chapters) and saved sessions
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [activeSessionChapters, setActiveSessionChapters] = useState<Chapter[]>([]);
  const [savedSessions, setSavedSessions] = useState<Session[]>([]);

  const clientSession = useMemoFirebase(() => {
    if (!activeSession) return null;
    return { ...activeSession, chapters: activeSessionChapters };
  }, [activeSession, activeSessionChapters]);

  // Fetch all sessions for the current user
  const sessionsQuery = useMemoFirebase(
    () =>
      user ? collection(firestore, 'userAccounts', user.uid, 'sessions') : null,
    [user, firestore]
  );
  const { data: sessions, isLoading: sessionsLoading } = useCollection<Session>(sessionsQuery);

  // Fetch chapters for the active session
  const chaptersQuery = useMemoFirebase(
    () =>
      user && activeSession
        ? query(collection(firestore, 'userAccounts', user.uid, 'sessions', activeSession.id, 'chapters'), orderBy('chapterNumber'))
        : null,
    [user, firestore, activeSession]
  );
  const { data: chapters } = useCollection<Chapter>(chaptersQuery);
  
  useEffect(() => {
    if (chapters) {
      setActiveSessionChapters(chapters);
    }
  }, [chapters]);


  // Process fetched sessions into active and saved
  useEffect(() => {
    if (sessions) {
      const active = sessions.find(s => s.status === 'active' || s.status === 'paused') || null;
      const saved = sessions.filter(s => s.status === 'ended');
      setActiveSession(active);
      setSavedSessions(saved);
    }
  }, [sessions]);

  // Determine initial view
  useEffect(() => {
    if (sessionsLoading) return;
    if (activeSession) {
      setView('active');
    } else if (savedSessions.length > 0) {
      setView('dashboard');
    } else {
      setView('setup');
    }
  }, [activeSession, savedSessions, sessionsLoading]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const updateSession = useCallback(
    (updates: Partial<Session>) => {
      if (activeSession && user) {
        // Optimistically update local state
        setActiveSession((prev) => (prev ? { ...prev, ...updates } : null));
        // Persist to Firestore
        updateSessionInDb(firestore, user.uid, activeSession.id, updates);
      }
    },
    [activeSession, user, firestore]
  );

  const generateChapter = useCallback(async () => {
    if (!clientSession || clientSession.isGenerating || !user) return;

    updateSession({ isGenerating: true });

    try {
      const isFirstChapter = clientSession.chapters.length === 0;
      let newChapterText = '';

      if (isFirstChapter) {
        const speedDescription = `The user is starting their journey at ${clientSession.speed.toFixed(
          1
        )} MPH.`;
        const result = await generateGenreSpecificStory({
          genre: clientSession.genre,
          plot: clientSession.plot,
          speedDescription,
        });
        newChapterText = result.storyChapter;
      } else {
        const storyContext = clientSession.chapters.map((c) => c.text).join('\n\n');
        const result = await generateAdaptiveStoryChapter({
          speedMph: clientSession.speed,
          distanceMiles: clientSession.distance,
          elapsedTimeMinutes: clientSession.elapsedTime / 60,
          storyContext,
          genre: clientSession.genre,
          plot: clientSession.plot,
          carpoolMode: clientSession.isCarpoolMode,
        });
        newChapterText = result.chapterText;
      }

      const newChapterData = {
        chapterNumber: clientSession.chapters.length + 1,
        text: newChapterText,
        createdAt: Date.now(),
      };

      createChapter(firestore, user.uid, clientSession.id, newChapterData);
      
      const nextDistance =
        clientSession.triggerType === 'distance'
          ? clientSession.distance +
            (clientSession.isCarpoolMode
              ? CARPOOL_TRIGGER_DISTANCE
              : CHAPTER_TRIGGER_DISTANCE)
          : clientSession.nextChapterDistance;

      updateSession({ isGenerating: false, nextChapterDistance: nextDistance });

    } catch (error) {
      console.error('Failed to generate chapter:', error);
      toast({
        variant: 'destructive',
        title: 'AI Generation Error',
        description:
          'Could not generate the next chapter. Please try again later.',
      });
      updateSession({ isGenerating: false });
    }
  }, [clientSession, updateSession, user, firestore, toast]);

  // Timer effect for active sessions
  useEffect(() => {
    if (activeSession?.status === 'active') {
      timerRef.current = setInterval(() => {
        // Use functional update to ensure we have the latest state
        setActiveSession((currentSession) => {
          if (!currentSession || currentSession.status !== 'active') {
            return currentSession;
          }
          
          const newElapsedTime = currentSession.elapsedTime + 1;
          const distanceThisSecond = currentSession.speed / 3600;
          const newDistance = currentSession.distance + distanceThisSecond;

          const updates: Partial<Session> = {
            elapsedTime: newElapsedTime,
            distance: newDistance,
          };
          
          // Persist to Firestore
          if (user) {
              // We batch updates to reduce Firestore writes, e.g., every 5 seconds
              if(newElapsedTime % 5 === 0) {
                updateSessionInDb(firestore, user.uid, currentSession.id, updates);
              }
          }
          
          // Time-based trigger
          if (
            currentSession.triggerType === 'time' &&
            newElapsedTime > 0 &&
            newElapsedTime % CHAPTER_TRIGGER_TIME === 0
          ) {
            generateChapter();
          }

          // Distance-based trigger
          if (
            currentSession.triggerType === 'distance' &&
            newDistance >= currentSession.nextChapterDistance
          ) {
            generateChapter();
          }

          return { ...currentSession, ...updates };
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSession?.status, user, firestore, generateChapter]);

  // Auto-start first chapter
  useEffect(() => {
    if (
      activeSession?.status === 'active' &&
      activeSessionChapters.length === 0 &&
      !activeSession.isGenerating
    ) {
      generateChapter();
    }
  }, [
    activeSession?.status,
    activeSessionChapters.length,
    activeSession?.isGenerating,
    generateChapter,
    activeSession
  ]);

  const startNewSession = (settings: {
    genre: string;
    plot: string;
    triggerType: 'time' | 'distance';
    isCarpoolMode: boolean;
  }) => {
    if (!user) return;

    // End any existing active session
    if (activeSession) {
      endSession();
    }

    const newSessionData = {
      name: `${settings.genre} Journey - ${new Date().toLocaleDateString()}`,
      ...settings,
      status: 'active' as const,
      startTime: Date.now(),
      elapsedTime: 0,
      speed: 0,
      distance: 0,
      isGenerating: false,
      nextChapterDistance:
        settings.triggerType === 'distance'
          ? settings.isCarpoolMode
            ? CARPOOL_TRIGGER_DISTANCE
            : CHAPTER_TRIGGER_DISTANCE
          : 0,
    };
    const newSession = createSession(firestore, user.uid, newSessionData);
    setActiveSession(newSession);
    setView('active');
  };

  const resumeSession = (sessionId: string) => {
    const sessionToResume = savedSessions.find((s) => s.id === sessionId);
    if (sessionToResume && user) {
      // End any other active session first
      if (activeSession && activeSession.id !== sessionId) {
          updateSessionInDb(firestore, user.uid, activeSession.id, { status: 'ended' });
      }
      setActiveSession({ ...sessionToResume, status: 'paused' });
      setView('active');
    }
  };

  const pauseSession = () => {
    if (activeSession) {
      const newStatus =
        activeSession.status === 'active' ? 'paused' : 'active';
      updateSession({ status: newStatus });
    }
  };

  const endSession = () => {
    if (activeSession && user) {
      updateSessionInDb(firestore, user.uid, activeSession.id, {
        status: 'ended',
      });
      setActiveSession(null);
      setView('dashboard');
    }
  };

  const deleteSavedSession = (sessionId: string) => {
    if (user) {
      deleteSession(firestore, user.uid, sessionId);
    }
  };

  return (
    <SessionContext.Provider
      value={{
        view,
        setView,
        session: clientSession,
        savedSessions,
        startNewSession,
        resumeSession,
        updateSession,
        pauseSession,
        endSession,
        deleteSavedSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
