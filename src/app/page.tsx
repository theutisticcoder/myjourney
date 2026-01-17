'use client';

import { AppContainer } from '@/components/my-journey-ai/AppContainer';
import { FirebaseClientProvider } from '@/firebase';
import { SessionProvider } from '@/context/SessionContext';

export default function Home() {
  return (
    <FirebaseClientProvider>
      <SessionProvider>
        <AppContainer />
      </SessionProvider>
    </FirebaseClientProvider>
  );
}
