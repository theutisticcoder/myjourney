'use client';

import { useSession } from '@/hooks/use-session';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BookOpen, Play, Trash2 } from 'lucide-react';

export const Dashboard = () => {
  const { savedSessions, resumeSession, deleteSavedSession, setView } =
    useSession();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">Saved Stories</h1>
        <p className="text-muted-foreground">
          Resume a previous journey or start a new one.
        </p>
      </div>

      {savedSessions.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle>No Saved Journeys</CardTitle>
            <CardDescription>
              Your completed adventures will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setView('setup')}>Create a New Story</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {savedSessions.map((session) => (
            <Card key={session.id} className="flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="font-headline">{session.name}</CardTitle>
                <CardDescription>
                  {session.genre}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Distance: {session.distance.toFixed(2)} miles</p>
                  <p>
                    Time:{' '}
                    {new Date(session.elapsedTime * 1000)
                      .toISOString()
                      .substr(11, 8)}
                  </p>
                  <p>
                    Saved on: {new Date(session.startTime).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => resumeSession(session.id)}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteSavedSession(session.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      {savedSessions.length > 0 && (
        <div className="text-center mt-8">
          <Button onClick={() => setView('setup')}>Create a New Story</Button>
        </div>
      )}
    </div>
  );
};
