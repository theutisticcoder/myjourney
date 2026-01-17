'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { useToast } from './use-toast';

export const useTTS = () => {
    const { toast } = useToast();
    const [isSpeaking, setIsSpeaking] = useState(false); // Represents loading OR playing
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const isCancelledRef = useRef(false);

    // This effect runs once to set up the audio element and its listeners.
    useEffect(() => {
        const audio = new Audio();
        audioRef.current = audio;

        const onEnd = () => setIsSpeaking(false);
        const onError = () => {
            console.error("Audio playback error");
            toast({ variant: "destructive", title: "Audio Error" });
            setIsSpeaking(false);
        };

        audio.addEventListener('ended', onEnd);
        audio.addEventListener('pause', onEnd);
        audio.addEventListener('error', onError);
        
        // Cleanup function for when the component unmounts.
        return () => {
            audio.pause();
            audio.removeEventListener('ended', onEnd);
            audio.removeEventListener('pause', onEnd);
            audio.removeEventListener('error', onError);
        };
    }, [toast]);
    
    const speak = useCallback(async (text: string) => {
        const audio = audioRef.current;
        if (!audio) return;

        // If we're already doing something, the user wants to stop.
        if (isSpeaking) {
            isCancelledRef.current = true;
            audio.pause(); // This will trigger the 'pause' event listener, which sets isSpeaking to false.
            return;
        }
        
        setIsSpeaking(true);
        isCancelledRef.current = false;
        try {
            const { audioDataUri } = await textToSpeech({ text });
            
            if (!isCancelledRef.current && audioRef.current) {
                audioRef.current.src = audioDataUri;
                audioRef.current.play();
            }
        } catch (error) {
            if (!isCancelledRef.current) {
                console.error("TTS Generation Error:", error);
                toast({
                    variant: "destructive",
                    title: "TTS Generation Error",
                    description: "Could not generate audio for the chapter.",
                });
                setIsSpeaking(false); // Ensure state is reset on error.
            }
        }
    }, [isSpeaking, toast]);

    const cancel = useCallback(() => {
        isCancelledRef.current = true;
        if (audioRef.current) {
            audioRef.current.pause();
        }
        setIsSpeaking(false);
    }, []);

    return { speak, cancel, isSpeaking, canUseTTS: true };
};
