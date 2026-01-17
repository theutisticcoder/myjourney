'use client';

import type { Chapter } from '@/lib/types';
import { useTTS } from '@/hooks/use-tts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Square } from 'lucide-react';

interface ChapterCardProps {
  chapter: Chapter;
}

export const ChapterCard = ({ chapter }: ChapterCardProps) => {
  const { speak, cancel, isSpeaking } = useTTS();

  const handleTogglePlay = () => {
    if (isSpeaking) {
      cancel();
    } else {
      speak(chapter.text);
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
      <CardHeader className="flex-row justify-between items-center">
        <CardTitle className="font-code text-sm text-primary">
          Chapter {chapter.chapterNumber} // Log Entry
        </CardTitle>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleTogglePlay}
          aria-label={isSpeaking ? 'Stop narration' : 'Play narration'}
        >
          {isSpeaking ? (
            <Square className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-lg/relaxed font-body text-foreground/90 whitespace-pre-wrap first-letter:text-7xl first-letter:font-bold first-letter:text-primary first-letter:mr-3 first-letter:float-left">
          {chapter.text}
        </p>
      </CardContent>
    </Card>
  );
};
