'use client';
import { doc, getDoc, Firestore } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { setDocumentNonBlocking } from './non-blocking-updates';

/**
 * Creates a user profile document in Firestore if it doesn't already exist.
 * This is a non-blocking "upsert" operation.
 * @param firestore - The Firestore instance.
 * @param user - The Firebase Auth User object.
 */
export async function upsertUserAccount(firestore: Firestore, user: User) {
  const userRef = doc(firestore, 'userAccounts', user.uid);

  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const newUserAccount = {
      id: user.uid,
      googleId:
        user.providerData.find((p) => p.providerId === 'google.com')?.uid ||
        user.uid,
      email: user.email,
      username: user.displayName || user.email?.split('@')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDocumentNonBlocking(userRef, newUserAccount, { merge: false });
  }
}
