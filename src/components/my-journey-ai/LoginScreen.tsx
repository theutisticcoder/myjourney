'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { signInWithGoogle } from '@/firebase/auth';
import { Chrome } from 'lucide-react';
import { NeonIcon } from './NeonIcon';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';


export const LoginScreen = () => {
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      if (error instanceof FirebaseError && error.code === 'auth/operation-not-allowed') {
        toast({
          variant: 'destructive',
          title: 'Sign-in Error',
          description: 'Google sign-in is not enabled for this app. Please try again in a moment as this should be enabled automatically.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Sign-in Failed',
          description: 'An unexpected error occurred during sign-in. Please try again.',
        });
        console.error('Google sign-in error:', error);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] font-headline">
      <div className="text-center mb-10">
        <NeonIcon>
          <Chrome className="mx-auto h-16 w-16" />
        </NeonIcon>
        <h1 className="text-5xl font-bold mt-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Welcome to MyJourneyAI
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Sign in to save your stories and track your progress.
        </p>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Use your Google account to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={handleGoogleSignIn}>
            <Chrome className="mr-2 h-5 w-5" />
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
