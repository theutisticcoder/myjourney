'use client';

import { useSession } from '@/hooks/use-session';
import { MetricsDisplay } from './MetricsDisplay';
import { Controls } from './Controls';
import { ChapterCard } from './ChapterCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useRef } from 'react';
import { Loader } from 'lucide-react';

const ChapterShimmer = () => (
  <div className="space-y-4 p-4 rounded-lg bg-card border">
    <Skeleton className="h-6 w-1/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-full" />
  </div>
);

export const ActiveSession = () => {
  const { session } = useSession();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom whenever a new chapter is added or generated
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        'div[data-radix-scroll-area-viewport]'
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [session?.chapters.length, session?.isGenerating]);

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="h-8 w-8 animate-spin" />
        <p className="ml-4">Loading your journey...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[calc(100vh-8rem)]">
      <MetricsDisplay />

      <div className="flex-grow my-4 relative">
        <ScrollArea className="h-full absolute inset-0" ref={scrollAreaRef}>
          <div className="space-y-6 pb-4">
            {session.chapters.map((chapter) => (
              <ChapterCard key={chapter.id} chapter={chapter} />
            ))}
            {session.isGenerating && <ChapterShimmer />}
            {session.chapters.length === 0 && !session.isGenerating && (
              <div className="text-center text-muted-foreground pt-16">
                <p>Your story is about to begin...</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <Controls />
    </div>
  );
};
