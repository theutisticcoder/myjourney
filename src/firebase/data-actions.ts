'use client';
import {
  doc,
  Firestore,
} from 'firebase/firestore';
import {
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
  setDocumentNonBlocking,
  updateDocumentNonBlocking,
} from './non-blocking-updates';
import type { Session, Chapter } from '@/lib/types';

// Session Actions
export function createSession(
  firestore: Firestore,
  userId: string,
  sessionData: Omit<Session, 'id' | 'userId'>
) {
  const sessionId = `session-${Date.now()}`;
  const newSession: Session = {
    ...sessionData,
    id: sessionId,
    userId: userId,
  };
  const sessionRef = doc(firestore, 'userAccounts', userId, 'sessions', sessionId);
  setDocumentNonBlocking(sessionRef, newSession, {});
  return newSession;
}

export function updateSession(
  firestore: Firestore,
  userId: string,
  sessionId: string,
  updates: Partial<Omit<Session, 'id' | 'userId'>>
) {
  const sessionRef = doc(firestore, 'userAccounts', userId, 'sessions', sessionId);
  updateDocumentNonBlocking(sessionRef, updates);
}

export function deleteSession(
  firestore: Firestore,
  userId: string,
  sessionId: string
) {
  const sessionRef = doc(firestore, 'userAccounts', userId, 'sessions', sessionId);
  deleteDocumentNonBlocking(sessionRef);
}

// Chapter Actions
export function createChapter(
  firestore: Firestore,
  userId: string,
  sessionId: string,
  chapterData: Omit<Chapter, 'id' | 'sessionId'>
) {
  const chapterId = `chapter-${Date.now()}`;
  const newChapter: Chapter = {
    ...chapterData,
    id: chapterId,
    sessionId: sessionId,
  };
  const chaptersRef = doc(firestore, 'userAccounts', userId, 'sessions', sessionId, 'chapters', chapterId);
  setDocumentNonBlocking(chaptersRef, newChapter, {});
  return newChapter;
}
