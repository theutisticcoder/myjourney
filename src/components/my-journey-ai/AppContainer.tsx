'use client';

import { useSession } from '@/hooks/use-session';
import { SetupScreen } from './SetupScreen';
import { ActiveSession } from './ActiveSession';
import { Dashboard } from './Dashboard';
import { useFirebase, useFirestore } from '@/firebase';
import { LoginScreen } from './LoginScreen';
import { UserProfile } from './UserProfile';
import { useEffect } from 'react';
import { upsertUserAccount } from '@/firebase/user-actions';
import { Skeleton } from '../ui/skeleton';

export const AppContainer = () => {
  const { view } = useSession();
  const { user, isUserLoading } = useFirebase();
  const firestore = useFirestore();

  useEffect(() => {
    if (user && firestore) {
      upsertUserAccount(firestore, user);
    }
  }, [user, firestore]);

  const renderContent = () => {
    if (isUserLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-48" />
        </div>
      );
    }

    if (!user) {
      return <LoginScreen />;
    }

    switch (view) {
      case 'setup':
        return <SetupScreen />;
      case 'active':
        return <ActiveSession />;
      case 'dashboard':
        return <Dashboard />;
      default:
        // Default to setup if logged in and no specific view is set
        return <SetupScreen />;
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <header className="flex justify-end mb-8 h-10">
        <UserProfile />
      </header>
      <main>{renderContent()}</main>
    </div>
  );
};
