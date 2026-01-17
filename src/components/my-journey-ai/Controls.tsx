'use client';

import { useSession } from '@/hooks/use-session';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Pause, Play, Flag, LogOut } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


export const Controls = () => {
  const { session, updateSession, pauseSession, endSession } = useSession();

  if (!session) return null;

  const formattedTime = new Date(session.elapsedTime * 1000)
    .toISOString()
    .substr(11, 8);

  return (
    <Card className="sticky bottom-4 w-full p-4 bg-card/80 backdrop-blur-lg border-primary/20 shadow-lg shadow-primary/10">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" onClick={pauseSession}>
                {session.status === 'active' ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 text-primary" />}
            </Button>
            <div className="font-code text-lg text-center w-24 tabular-nums bg-background/50 py-1.5 px-2 rounded-md">
                {formattedTime}
            </div>
        </div>

        <div className="flex-grow flex items-center gap-3">
            <span className="font-code text-sm text-muted-foreground">MPH</span>
            <Slider
                value={[session.speed]}
                onValueChange={(value) => updateSession({ speed: value[0] })}
                min={0}
                max={20}
                step={0.1}
            />
        </div>
        
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                    <LogOut className="h-5 w-5" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>End Your Journey?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will save your current progress and move this session to your dashboard. You can resume it later.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={endSession}>End Journey</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

      </div>
    </Card>
  );
};
