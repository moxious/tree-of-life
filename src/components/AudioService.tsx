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
  },
  chord: {
    octaves: 3,
    baseOctave: 4,
    duration: 3000,
    waveform: 'sine',
    envelope: {
      attack: 0.5,
      decay: 0.4,
      sustain: 0.7,
      release: 2.0
    },
    gain: 0.25,
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

// Audio service state interface
interface AudioServiceState {
  isInitialized: boolean;
  isPlaying: boolean;
  activeVoices: Set<string>;
}

// Maximum number of simultaneous voices to prevent clipping
const MAX_SIMULTANEOUS_VOICES = 12;

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

  const gain = new Tone.Gain(0.2); // Master volume control - reduced to prevent clipping
  
  // Add a limiter to prevent clipping
  const limiter = new Tone.Limiter(-3); // Limit to -3dB to prevent clipping

  // Chain: chorus -> reverb -> gain -> limiter -> destination
  chorus.connect(reverb);
  reverb.connect(gain);
  gain.connect(limiter);
  limiter.toDestination();

  return { chorus, reverb, gain, limiter };
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
      const frequencies = generateOctaveFrequencies(normalizedNote, octaves);
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
        
        // Update master gain to prevent clipping
        updateMasterGain();
        
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

  // Pure function to play a chord (multiple notes)
  const playChord = useCallback(async (noteNames: string[], audioConfig: AudioConfig): Promise<void> => {
    console.log('🎵 AudioService: playChord called with notes:', noteNames);
    
    if (!stateRef.current.isInitialized || !effectsRef.current) {
      console.log('🎵 AudioService: Audio not initialized, initializing...');
      await initializeAudio(audioConfig);
    }

    if (noteNames.length === 0) {
      console.log('🎵 AudioService: No notes to play');
      return;
    }

    try {
      const chordConfig = audioConfig.chord;
      const octaves = createOctaveRange(chordConfig.octaves, chordConfig.baseOctave);
      const timestamp = Date.now();
      
      // Deduplicate notes
      const uniqueNotes = [...new Set(noteNames.map(note => normalizeNoteName(note)))];
      console.log('🎵 AudioService: Playing chord with unique notes:', uniqueNotes);
      
      // Create effects chain for chord (separate from path effects)
      const chordEffects = createEffectsChain({
        ...audioConfig,
        reverb: chordConfig.reverb,
        chorus: chordConfig.chorus
      });
      
      const playNoteAtTime = (noteName: string, delayMs: number = 0) => {
        const frequencies = generateOctaveFrequencies(noteName, octaves);
        
        frequencies.forEach((frequency, index) => {
          // Check if we've reached the maximum number of simultaneous voices
          if (stateRef.current.activeVoices.size >= MAX_SIMULTANEOUS_VOICES) {
            console.log(`🎵 AudioService: Maximum voices (${MAX_SIMULTANEOUS_VOICES}) reached, skipping additional oscillators`);
            return;
          }
          
          const octave = octaves[index];
          const voiceId = createVoiceId(`${noteName}-chord`, octave, timestamp + delayMs);
          
          console.log(`🎵 AudioService: Creating chord oscillator ${index + 1}/${frequencies.length} - Note: ${noteName}${octave}, Frequency: ${frequency}Hz, Voice ID: ${voiceId}`);
          const { oscillator, envelope, gainNode } = createOscillator(frequency, {
            ...audioConfig,
            ...chordConfig
          });
          
          // Connect gain node to chord effects chain
          gainNode.connect(chordEffects.gain);
          
          // Store voice for cleanup
          voicesRef.current.set(voiceId, { oscillator, envelope, gainNode });
          stateRef.current.activeVoices.add(voiceId);
          
          // Update master gain to prevent clipping
          updateMasterGain();
          
          oscillator.start();
          
          // Schedule note based on chord style
          if (chordConfig.style === 'simultaneous') {
            envelope.triggerAttackRelease(chordConfig.duration / 1000);
          } else {
            // For arpeggio and roll, delay the trigger
            setTimeout(() => {
              envelope.triggerAttackRelease(chordConfig.duration / 1000);
            }, delayMs);
          }
          
          // Clean up after duration
          setTimeout(() => {
            console.log(`🎵 AudioService: Cleaning up chord voice ${voiceId}`);
            cleanupVoice(voiceId);
          }, chordConfig.duration + 2000); // Extra buffer for envelope release
        });
      };
      
      // Play notes based on chord style
      if (chordConfig.style === 'simultaneous') {
        // Play all notes at once
        uniqueNotes.forEach(noteName => playNoteAtTime(noteName));
      } else if (chordConfig.style === 'arpeggio') {
        // Play notes in sequence with arpeggio delay
        uniqueNotes.forEach((noteName, index) => {
          playNoteAtTime(noteName, index * chordConfig.arpeggioDelay);
        });
      } else if (chordConfig.style === 'roll') {
        // Play notes in quick succession with roll delay
        uniqueNotes.forEach((noteName, index) => {
          playNoteAtTime(noteName, index * chordConfig.rollDelay);
        });
      }
      
      stateRef.current.isPlaying = true;
      console.log(`🎵 AudioService: Chord started with ${uniqueNotes.length} unique notes, style: ${chordConfig.style}`);
    } catch (error) {
      console.error('🎵 AudioService: Error in playChord:', error);
      onError?.(error as Error);
    }
  }, [initializeAudio, onError]);

  // Pure function to update master gain based on active voices
  const updateMasterGain = useCallback((): void => {
    if (effectsRef.current) {
      const activeVoiceCount = stateRef.current.activeVoices.size;
      // Reduce gain as more voices are added to prevent clipping
      // Base gain of 0.2, reduced by 0.02 per additional voice (max reduction to 0.05)
      const dynamicGain = Math.max(0.05, 0.2 - (activeVoiceCount - 1) * 0.02);
      effectsRef.current.gain.gain.value = dynamicGain;
      console.log(`🎵 AudioService: Updated master gain to ${dynamicGain} for ${activeVoiceCount} active voices`);
    }
  }, []);

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
    
    // Update master gain based on active voices to prevent clipping
    updateMasterGain();
  }, [updateMasterGain]);

  // Pure function to stop all voices
  const stopAllVoices = useCallback((): void => {
    voicesRef.current.forEach((voice) => {
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
        effectsRef.current.limiter.dispose();
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
    
    console.log('🎵 AudioService: Exposing global playTreeOfLifeChord function');
    (window as any).playTreeOfLifeChord = (noteNames: string[]) => {
      console.log('🎵 AudioService: Global playTreeOfLifeChord called with notes:', noteNames);
      playChord(noteNames, config);
    };
    
    // Add debug function to check audio state
    (window as any).debugAudioState = () => {
      const masterGain = effectsRef.current?.gain.gain.value || 0;
      console.log('🎵 AudioService: Debug Info', {
        isInitialized: stateRef.current.isInitialized,
        isPlaying: stateRef.current.isPlaying,
        activeVoices: stateRef.current.activeVoices.size,
        maxVoices: MAX_SIMULTANEOUS_VOICES,
        masterGain: masterGain,
        masterGainDb: 20 * Math.log10(masterGain),
        hasEffects: !!effectsRef.current,
        toneContextState: Tone.context.state,
        toneContextSampleRate: Tone.context.sampleRate
      });
    };
    
    return () => {
      console.log('🎵 AudioService: Cleaning up global audio functions');
      delete (window as any).playTreeOfLifeNote;
      delete (window as any).playTreeOfLifeChord;
      delete (window as any).debugAudioState;
    };
  }, [playNote, playChord, config]);

  // This component doesn't render anything - it's a service
  return null;
};

export default AudioService;