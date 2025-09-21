// AudioService component for Tree of Life sound management
// Functional approach with pure functions and immutable state

import React, { useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import type { AudioConfig } from '../types/audio';
import { generateOctaveFrequencies, normalizeNoteName } from '../utils/musicalNotes';

// Default configuration
const defaultAudioConfig: AudioConfig = {
  octaves: 6,
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
  }
};

// Audio service state interface
interface AudioServiceState {
  isInitialized: boolean;
  isPlaying: boolean;
  activeVoices: Set<string>;
}

// Audio service props
interface AudioServiceProps {
  config?: AudioConfig;
  onError?: (error: Error) => void;
}

// Pure function to create initial audio service state
const createInitialState = (): AudioServiceState => ({
  isInitialized: false,
  isPlaying: false,
  activeVoices: new Set()
});

// Pure function to create octave range
const createOctaveRange = (octaves: number, baseOctave: number): number[] => {
  const halfRange = Math.floor(octaves / 2);
  const startOctave = baseOctave - halfRange;
  
  return Array.from(
    { length: octaves },
    (_, index) => startOctave + index
  );
};

// Pure function to create audio effects chain
const createEffectsChain = (config: AudioConfig) => {
  const chorus = new Tone.Chorus({
    frequency: config.chorus.frequency,
    delayTime: config.chorus.delayTime,
    depth: config.chorus.depth,
    wet: config.chorus.enabled ? 1 : 0
  });

  const reverb = new Tone.Reverb({
    decay: config.reverb.roomSize,
    wet: config.reverb.enabled ? config.reverb.wet : 0
  });

  const gain = new Tone.Gain(0.3); // Master volume control

  // Chain: chorus -> reverb -> gain -> destination
  chorus.connect(reverb);
  reverb.connect(gain);
  gain.toDestination();

  return { chorus, reverb, gain };
};

// Pure function to create oscillator for a specific frequency
const createOscillator = (frequency: number, config: AudioConfig) => {
  const oscillator = new Tone.Oscillator({
    frequency,
    type: config.waveform
  });

  const envelope = new Tone.Envelope({
    attack: config.envelope.attack,
    decay: config.envelope.decay,
    sustain: config.envelope.sustain,
    release: config.envelope.release
  });

  // Create a gain node to control the oscillator volume
  const gainNode = new Tone.Gain(config.gain);

  // Connect oscillator to gain node
  oscillator.connect(gainNode);

  // Connect envelope to gain node's gain parameter (not the audio signal)
  envelope.connect(gainNode.gain);

  return { oscillator, envelope, gainNode };
};

// Pure function to calculate voice ID for tracking
const createVoiceId = (noteName: string, octave: number, timestamp: number): string => {
  return `${noteName}-${octave}-${timestamp}`;
};

// AudioService component using functional programming principles
const AudioService: React.FC<AudioServiceProps> = ({ 
  config = defaultAudioConfig, 
  onError 
}) => {
  const stateRef = useRef<AudioServiceState>(createInitialState());
  const effectsRef = useRef<ReturnType<typeof createEffectsChain> | null>(null);
  const voicesRef = useRef<Map<string, { oscillator: Tone.Oscillator; envelope: Tone.Envelope; gainNode: Tone.Gain }>>(new Map());

  // Pure function to validate configuration
  const validateConfig = useCallback((audioConfig: AudioConfig): boolean => {
    const isValidOctaves = audioConfig.octaves > 0 && audioConfig.octaves <= 7;
    const isValidBaseOctave = audioConfig.baseOctave >= 0 && audioConfig.baseOctave <= 8;
    const isValidDuration = audioConfig.duration > 0;
    const isValidEnvelope = audioConfig.envelope.attack >= 0 && 
                           audioConfig.envelope.decay >= 0 && 
                           audioConfig.envelope.sustain >= 0 && audioConfig.envelope.sustain <= 1 &&
                           audioConfig.envelope.release >= 0;
    const isValidGain = audioConfig.gain >= 0 && audioConfig.gain <= 1;
    const isValidReverb = audioConfig.reverb.roomSize >= 0 && audioConfig.reverb.roomSize <= 1 && 
                         audioConfig.reverb.wet >= 0 && audioConfig.reverb.wet <= 1;
    const isValidChorus = audioConfig.chorus.frequency > 0 && 
                         audioConfig.chorus.delayTime > 0 && 
                         audioConfig.chorus.depth >= 0 && audioConfig.chorus.depth <= 1;
    
    const isValid = isValidOctaves && isValidBaseOctave && isValidDuration && 
                   isValidEnvelope && isValidGain && isValidReverb && isValidChorus;
    
    if (!isValid) {
      onError?.(new Error('Invalid audio configuration'));
    }
    
    return isValid;
  }, [onError]);

  // Pure function to initialize audio context
  const initializeAudio = useCallback(async (audioConfig: AudioConfig): Promise<boolean> => {
    try {
      if (!validateConfig(audioConfig)) {
        console.log('🎵 AudioService: Audio config validation failed');
        return false;
      }

      await Tone.start();
      
      // Create effects chain
      effectsRef.current = createEffectsChain(audioConfig);
      console.log('🎵 AudioService: Effects chain created');
      
      stateRef.current = {
        ...stateRef.current,
        isInitialized: true
      };
      
      console.log('🎵 AudioService: Audio initialization complete');
      return true;
    } catch (error) {
      console.error('🎵 AudioService: Error initializing audio:', error);
      onError?.(error as Error);
      return false;
    }
  }, [validateConfig, onError]);

  // Pure function to play a musical note
  const playNote = useCallback(async (noteName: string, audioConfig: AudioConfig): Promise<void> => {
    console.log('🎵 AudioService: playNote called with note:', noteName);
    
    if (!stateRef.current.isInitialized || !effectsRef.current) {
      console.log('🎵 AudioService: Audio not initialized, initializing...');
      await initializeAudio(audioConfig);
    }

    try {
      const normalizedNote = normalizeNoteName(noteName);
      const octaves = createOctaveRange(audioConfig.octaves, audioConfig.baseOctave);
      const frequencies = generateOctaveFrequencies(normalizedNote, octaves, audioConfig.baseOctave);
      const timestamp = Date.now();
      
      // Create and play oscillators for each octave
      frequencies.forEach((frequency, index) => {
        const octave = octaves[index];
        const voiceId = createVoiceId(normalizedNote, octave, timestamp);
        
        console.log(`🎵 AudioService: Creating oscillator ${index + 1}/${frequencies.length} - Note: ${normalizedNote}${octave}, Frequency: ${frequency}Hz, Voice ID: ${voiceId}`);        
        const { oscillator, envelope, gainNode } = createOscillator(frequency, audioConfig);
        
        // Connect gain node to effects chain
        gainNode.connect(effectsRef.current!.gain);
        
        // Store voice for cleanup
        voicesRef.current.set(voiceId, { oscillator, envelope, gainNode });
        stateRef.current.activeVoices.add(voiceId);
        
        oscillator.start();
        envelope.triggerAttackRelease(audioConfig.duration / 1000);
        
        console.log(`🎵 AudioService: Audio scheduled to play for ${audioConfig.duration}ms`);
        
        // Clean up after duration
        setTimeout(() => {
          console.log(`🎵 AudioService: Cleaning up voice ${voiceId}`);
          cleanupVoice(voiceId);
        }, audioConfig.duration + 1000); // Extra buffer for envelope release
      });
      
      stateRef.current.isPlaying = true;
      console.log('🎵 AudioService: All oscillators started, isPlaying set to true');
    } catch (error) {
      console.error('🎵 AudioService: Error in playNote:', error);
      onError?.(error as Error);
    }
  }, [initializeAudio, onError]);

  // Pure function to cleanup a specific voice
  const cleanupVoice = useCallback((voiceId: string): void => {
    const voice = voicesRef.current.get(voiceId);
    if (voice) {
      voice.oscillator.stop();
      voice.oscillator.dispose();
      voice.envelope.dispose();
      voice.gainNode.dispose();
      voicesRef.current.delete(voiceId);
    }
    stateRef.current.activeVoices.delete(voiceId);
    
    // Update playing state
    if (stateRef.current.activeVoices.size === 0) {
      stateRef.current.isPlaying = false;
    }
  }, []);

  // Pure function to stop all voices
  const stopAllVoices = useCallback((): void => {
    voicesRef.current.forEach((voice, voiceId) => {
      voice.oscillator.stop();
      voice.oscillator.dispose();
      voice.envelope.dispose();
      voice.gainNode.dispose();
    });
    voicesRef.current.clear();
    stateRef.current.activeVoices.clear();
    stateRef.current.isPlaying = false;
  }, []);

  // Initialize audio on mount
  useEffect(() => {
    initializeAudio(config);
    
    // Cleanup on unmount
    return () => {
      stopAllVoices();
      if (effectsRef.current) {
        effectsRef.current.chorus.dispose();
        effectsRef.current.reverb.dispose();
        effectsRef.current.gain.dispose();
      }
    };
  }, [config, initializeAudio, stopAllVoices]);

  // Expose playNote function globally for use by other components
  useEffect(() => {
    console.log('🎵 AudioService: Exposing global playTreeOfLifeNote function');
    (window as any).playTreeOfLifeNote = (noteName: string) => {
      console.log('🎵 AudioService: Global playTreeOfLifeNote called with note:', noteName);
      playNote(noteName, config);
    };
    
    // Add debug function to check audio state
    (window as any).debugAudioState = () => {
      console.log('🎵 AudioService: Debug Info', {
        isInitialized: stateRef.current.isInitialized,
        isPlaying: stateRef.current.isPlaying,
        activeVoices: stateRef.current.activeVoices.size,
        hasEffects: !!effectsRef.current,
        toneContextState: Tone.context.state,
        toneContextSampleRate: Tone.context.sampleRate
      });
    };
    
    return () => {
      console.log('🎵 AudioService: Cleaning up global playTreeOfLifeNote function');
      delete (window as any).playTreeOfLifeNote;
      delete (window as any).debugAudioState;
    };
  }, [playNote, config]);

  // This component doesn't render anything - it's a service
  return null;
};

export default AudioService;