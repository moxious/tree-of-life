// Global audio functions for Tree of Life
// Extracted from AudioService to allow integration with MusicControl

import { addToNowPlaying, isSoundEnabled } from '../hooks/useAudioControl';

// Global audio service reference
let globalPlayNote: ((noteName: string, config: any) => Promise<void>) | null = null;
let globalPlayChord: ((noteNames: string[], config: any) => Promise<void>) | null = null;
let globalConfig: any = null;

// Set up global audio service functions
export const setupGlobalAudioFunctions = (
  playNote: (noteName: string, config: any) => Promise<void>,
  playChord: (noteNames: string[], config: any) => Promise<void>,
  config: any
) => {
  globalPlayNote = playNote;
  globalPlayChord = playChord;
  globalConfig = config;

  console.log('🎵 AudioGlobalFunctions: Setting up global functions');

  // Expose playNote function globally for use by other components
  (window as any).playTreeOfLifeNote = (noteName: string, source?: string) => {
    console.log('🎵 AudioGlobalFunctions: Global playTreeOfLifeNote called with note:', noteName, 'source:', source);
    
    // Add to now playing regardless of sound enabled state
    if (source) {
      addToNowPlaying(source, [noteName], globalConfig?.duration || 2000);
    }
    
    // Only play audio if sound is enabled
    if (isSoundEnabled() && globalPlayNote) {
      globalPlayNote(noteName, globalConfig);
    }
  };
  
  // Expose playChord function globally for use by other components
  (window as any).playTreeOfLifeChord = (noteNames: string[], source?: string) => {
    console.log('🎵 AudioGlobalFunctions: Global playTreeOfLifeChord called with notes:', noteNames, 'source:', source);
    
    // Add to now playing regardless of sound enabled state
    if (source) {
      addToNowPlaying(source, noteNames, globalConfig?.chord?.duration || 3000);
    }
    
    // Only play audio if sound is enabled
    if (isSoundEnabled() && globalPlayChord) {
      globalPlayChord(noteNames, globalConfig);
    }
  };
  
  // Add debug function to check audio state
  (window as any).debugAudioState = () => {
    console.log('🎵 AudioGlobalFunctions: Debug Info', {
      soundEnabled: isSoundEnabled(),
      hasPlayNote: !!globalPlayNote,
      hasPlayChord: !!globalPlayChord,
      hasConfig: !!globalConfig
    });
  };
};

// Cleanup global audio functions
export const cleanupGlobalAudioFunctions = () => {
  console.log('🎵 AudioGlobalFunctions: Cleaning up global audio functions');
  delete (window as any).playTreeOfLifeNote;
  delete (window as any).playTreeOfLifeChord;
  delete (window as any).debugAudioState;
  
  globalPlayNote = null;
  globalPlayChord = null;
  globalConfig = null;
};
