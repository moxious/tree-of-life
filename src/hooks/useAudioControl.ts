import { useState, useRef, useCallback } from 'react';
import type { NowPlayingEntry, AudioServiceRef } from '../types/audio';

// Global state for now playing entries
let globalSetNowPlaying: React.Dispatch<React.SetStateAction<NowPlayingEntry[]>> | null = null;
let globalSoundEnabled = false;
let globalSetSoundEnabled: React.Dispatch<React.SetStateAction<boolean>> | null = null;
let cleanupTimeouts = new Map<string, number>();

// Pure function to generate unique ID
const generateId = (): string => `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Pure function to create now playing entry
const createNowPlayingEntry = (
  source: string,
  notes: string[],
  duration: number
): NowPlayingEntry => ({
  id: generateId(),
  source,
  notes,
  startTime: Date.now(),
  duration
});

// Function to add entry to now playing (can be called from anywhere)
export const addToNowPlaying = (source: string, notes: string[], duration: number): string => {
  const entry = createNowPlayingEntry(source, notes, duration);
  
  if (globalSetNowPlaying) {
    globalSetNowPlaying(prev => [...prev, entry]);
  }
  
  // Schedule cleanup
  const timeout = setTimeout(() => {
    removeFromNowPlaying(entry.id);
  }, duration + 1000); // Extra buffer for envelope release
  
  cleanupTimeouts.set(entry.id, timeout);
  
  return entry.id;
};

// Function to remove entry from now playing (can be called from anywhere)
export const removeFromNowPlaying = (id: string): void => {
  if (globalSetNowPlaying) {
    globalSetNowPlaying(prev => prev.filter(entry => entry.id !== id));
  }
  
  // Clear timeout if it exists
  const timeout = cleanupTimeouts.get(id);
  if (timeout) {
    clearTimeout(timeout);
    cleanupTimeouts.delete(id);
  }
};

// Function to get current sound enabled state
export const isSoundEnabled = (): boolean => globalSoundEnabled;

// Function to set sound enabled state
export const setSoundEnabled = (enabled: boolean): void => {
  globalSoundEnabled = enabled;
  if (globalSetSoundEnabled) {
    globalSetSoundEnabled(enabled);
  }
};

// Hook for MusicControl component
export const useAudioControl = () => {
  const [nowPlaying, setNowPlaying] = useState<NowPlayingEntry[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const audioServiceRef = useRef<AudioServiceRef>(null);

  // Set up global state references
  globalSetNowPlaying = setNowPlaying;
  globalSoundEnabled = soundEnabled;
  globalSetSoundEnabled = setSoundEnabled;

  // Local functions for the component
  const handleSetSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled);
    globalSoundEnabled = enabled;
  }, []);

  const handleAddToNowPlaying = useCallback((source: string, notes: string[], duration: number) => {
    return addToNowPlaying(source, notes, duration);
  }, []);

  const handleRemoveFromNowPlaying = useCallback((id: string) => {
    removeFromNowPlaying(id);
  }, []);

  return {
    nowPlaying,
    soundEnabled,
    setSoundEnabled: handleSetSoundEnabled,
    addToNowPlaying: handleAddToNowPlaying,
    removeFromNowPlaying: handleRemoveFromNowPlaying,
    audioServiceRef
  };
};
