// Audio Context Provider - Centralized audio state management
// Replaces global functions and scattered state with React Context API

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import type { AudioContextValue, AudioState, AudioActions, AudioConfig, NowPlayingEntry } from '../types/audio';
import { AudioService } from '../services/AudioService';

// Default audio configuration
const defaultAudioConfig: AudioConfig = {
  octaves: 1,
  baseOctave: 4,
  duration: 1000,
  waveform: 'sine',
  envelope: {
    attack: 0.3,
    decay: 0.3,
    sustain: 0.8,
    release: 1.5
  },
  gain: 0.0,
  reverb: {
    enabled: true,
    roomSize: 0.7,
    wet: 0.3
  },
  chorus: {
    enabled: false,
    frequency: 1.5,
    delayTime: 5.5,
    depth: 0.7
  },
  chord: {
    octaves: 1,
    baseOctave: 4,
    duration: 1000,
    waveform: 'sine',
    envelope: {
      attack: 0.5,
      decay: 0.4,
      sustain: 0.7,
      release: 2.0
    },
    gain: 0.0,
    reverb: {
      enabled: true,
      roomSize: 0.8,
      wet: 0.4
    },
    chorus: {
      enabled: true,
      frequency: 1.2,
      delayTime: 4.0,
      depth: 0.8
    },
    style: 'simultaneous',
    arpeggioDelay: 150,
    rollDelay: 100
  }
};

// Audio state actions
type AudioAction =
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_SOUND_ENABLED'; payload: boolean }
  | { type: 'ADD_NOW_PLAYING'; payload: NowPlayingEntry }
  | { type: 'REMOVE_NOW_PLAYING'; payload: string }
  | { type: 'SET_ACTIVE_VOICES'; payload: Set<string> }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

// Initial audio state
const initialAudioState: AudioState = {
  isInitialized: false,
  isPlaying: false,
  soundEnabled: false,
  nowPlaying: [],
  activeVoices: new Set(),
  error: null
};

// Audio state reducer
const audioReducer = (state: AudioState, action: AudioAction): AudioState => {
//   console.log('🎵 AudioReducer: Action received:', action.type, 'payload:', 'payload' in action ? action.payload : 'none');
//   console.log('🎵 AudioReducer: Current state before update:', state);
  
  let newState: AudioState;
  switch (action.type) {
    case 'SET_INITIALIZED':
      newState = { ...state, isInitialized: action.payload };
      break;
    case 'SET_PLAYING':
      newState = { ...state, isPlaying: action.payload };
      break;
    case 'SET_SOUND_ENABLED':
      newState = { ...state, soundEnabled: action.payload };
      break;
    case 'ADD_NOW_PLAYING':
      newState = { ...state, nowPlaying: [...state.nowPlaying, action.payload] };
      break;
    case 'REMOVE_NOW_PLAYING':
      newState = { 
        ...state, 
        nowPlaying: state.nowPlaying.filter(entry => entry.id !== action.payload) 
      };
      break;
    case 'SET_ACTIVE_VOICES':
      newState = { ...state, activeVoices: action.payload };
      break;
    case 'SET_ERROR':
      newState = { ...state, error: action.payload };
      break;
    case 'CLEAR_ERROR':
      newState = { ...state, error: null };
      break;
    default:
      newState = state;
  }
  
//   console.log('🎵 AudioReducer: New state after update:', newState);
  return newState;
};

// Create audio context
const AudioContext = createContext<AudioContextValue | undefined>(undefined);

// Audio context provider props
interface AudioProviderProps {
  config?: AudioConfig;
  children: React.ReactNode;
}

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

// Audio context provider component
export const AudioProvider: React.FC<AudioProviderProps> = ({ 
  config = defaultAudioConfig, 
  children 
}) => {
  const [state, dispatch] = useReducer(audioReducer, initialAudioState);
  const audioServiceRef = useRef<AudioService | null>(null);
  const cleanupTimeoutsRef = useRef<Map<string, number>>(new Map());
  const stateRef = useRef<AudioState>(state);

  // Keep stateRef updated with current state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Initialize audio service
  useEffect(() => {
    const audioService = new AudioService();
    audioServiceRef.current = audioService;
    
    // Don't auto-initialize - wait for user interaction
    // console.log('🎵 AudioContext: Audio service created, waiting for user interaction...');

    return () => {
      audioService.cleanup();
    };
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      cleanupTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      cleanupTimeoutsRef.current.clear();
    };
  }, []);

  // Add entry to now playing
  const addToNowPlaying = useCallback((source: string, notes: string[], duration: number): string => {
    const entry = createNowPlayingEntry(source, notes, duration);
    dispatch({ type: 'ADD_NOW_PLAYING', payload: entry });
    
    // Schedule cleanup
    const timeout = setTimeout(() => {
      dispatch({ type: 'REMOVE_NOW_PLAYING', payload: entry.id });
    }, duration + 1000);
    
    cleanupTimeoutsRef.current.set(entry.id, timeout);
    return entry.id;
  }, []);

  // Initialize audio service on first user interaction
  const initializeAudioIfNeeded = useCallback(async (): Promise<boolean> => {
    if (!audioServiceRef.current) {
      dispatch({ type: 'SET_ERROR', payload: 'Audio service not available' });
      return false;
    }

    if (state.isInitialized) {
      return true;
    }

    try {
      console.log('🎵 AudioContext: Initializing audio on user interaction...');
      const success = await audioServiceRef.current.initialize();
      console.log('🎵 AudioContext: Audio initialization result:', success);
      dispatch({ type: 'SET_INITIALIZED', payload: success });
      if (!success) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize audio context' });
      }
      return success;
    } catch (error) {
      console.error('🎵 AudioContext: Audio initialization error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown audio initialization error';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    }
  }, [state.isInitialized]);

  // Initialize audio context on any user interaction (for iOS compatibility)
  const initializeAudioOnFirstInteraction = useCallback(async (): Promise<boolean> => {
    if (state.isInitialized) return true;
    
    try {
      const success = await audioServiceRef.current?.initialize();
      if (success) {
        dispatch({ type: 'SET_INITIALIZED', payload: true });
      }
      return success || false;
    } catch (error) {
      console.error('Audio initialization failed:', error);
      return false;
    }
  }, [state.isInitialized]);

  // Play a musical note - NOT using useCallback to avoid closure issues
  const playNote = async (note: string, source: string): Promise<void> => {
    if (!audioServiceRef.current) {
      dispatch({ type: 'SET_ERROR', payload: 'Audio service not available' });
      return;
    }

    try {
      // Initialize audio context on first interaction (for iOS compatibility)
      await initializeAudioOnFirstInteraction();
      
      // Add to now playing regardless of sound enabled state
      addToNowPlaying(source, [note], config.duration);
      
      // Only play audio if sound is enabled - use current state value from ref
      const currentState = stateRef.current;
      const currentSoundEnabled = currentState.soundEnabled;
      if (currentSoundEnabled) {
        const initialized = await initializeAudioIfNeeded();
        if (initialized) {
          await audioServiceRef.current.playNote(note, config);
          dispatch({ type: 'SET_PLAYING', payload: true });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown audio error';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  // Play a chord - NOT using useCallback to avoid closure issues
  const playChord = async (notes: string[], source: string): Promise<void> => {
    console.log('🎵 AudioContext: playChord function called with notes:', notes, 'source:', source);
    
    // Use stateRef to get the current state, not the captured state
    const currentState = stateRef.current;
    console.log('🎵 AudioContext: Current state from ref - soundEnabled:', currentState.soundEnabled, 'isInitialized:', currentState.isInitialized);
    
    if (!audioServiceRef.current) {
      console.log('🎵 AudioContext: No audio service available');
      dispatch({ type: 'SET_ERROR', payload: 'Audio service not available' });
      return;
    }

    try {
      // Initialize audio context on first interaction (for iOS compatibility)
      await initializeAudioOnFirstInteraction();
      
      console.log('🎵 AudioContext: Adding to now playing...');
      // Add to now playing regardless of sound enabled state
      addToNowPlaying(source, notes, config.chord.duration);
      
      // Only play audio if sound is enabled - use current state value from ref
      const currentSoundEnabled = currentState.soundEnabled;
      console.log('🎵 AudioContext: Checking sound enabled state from ref:', currentSoundEnabled);
      
      if (currentSoundEnabled) {
        console.log('🎵 AudioContext: Sound is enabled, proceeding with audio playback');
        const initialized = await initializeAudioIfNeeded();
        if (initialized) {
          console.log('🎵 AudioContext: Audio initialized, calling playChord on service');
          await audioServiceRef.current.playChord(notes, config);
          dispatch({ type: 'SET_PLAYING', payload: true });
          console.log('🎵 AudioContext: Chord playback completed');
        } else {
          console.log('🎵 AudioContext: Audio initialization failed');
        }
      } else {
        console.log('🎵 AudioContext: Sound is disabled, skipping audio playback');
      }
    } catch (error) {
      console.error('🎵 AudioContext: Error in playChord:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown audio error';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  // Set sound enabled state
  const setSoundEnabled = useCallback(async (enabled: boolean) => {
    console.log('🎵 AudioContext: setSoundEnabled called with:', enabled);
    console.log('🎵 AudioContext: Current state before update - soundEnabled:', state.soundEnabled, 'isInitialized:', state.isInitialized);
    
    dispatch({ type: 'SET_SOUND_ENABLED', payload: enabled });
    console.log('🎵 AudioContext: Dispatched SET_SOUND_ENABLED with payload:', enabled);
    
    // Initialize audio when user enables sound
    if (enabled && !state.isInitialized) {
      console.log('🎵 AudioContext: Enabling sound and initializing audio...');
      await initializeAudioIfNeeded();
    }
    
    console.log('🎵 AudioContext: setSoundEnabled completed');
  }, [state.isInitialized, state.soundEnabled, initializeAudioIfNeeded]);

  // Stop all sounds
  const stopAllSounds = useCallback(() => {
    if (audioServiceRef.current) {
      audioServiceRef.current.stopAllVoices();
      dispatch({ type: 'SET_PLAYING', payload: false });
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Create actions object
  const actions: AudioActions = {
    playNote,
    playChord,
    setSoundEnabled,
    stopAllSounds,
    clearError
  };

  // Create context value
  const contextValue: AudioContextValue = {
    state,
    actions,
    config
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
};

// Hook to use audio context
export const useAudio = (): AudioContextValue => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

// Export context for testing
export { AudioContext };
