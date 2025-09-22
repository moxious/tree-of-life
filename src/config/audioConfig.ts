// Audio configuration for Tree of Life sound feature
// Functional approach with immutable configuration objects

import type { AudioConfig } from '../types/audio';

// Re-export the type
export type { AudioConfig };

// Default configuration - immutable object
export const defaultAudioConfig: AudioConfig = {
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
  gain: 0.15, // Reduced from 0.3 to prevent clipping
  reverb: {
    enabled: true,
    roomSize: 0.7,
    wet: 0.3
  },
  chorus: {
    enabled: true,
    frequency: 1.5,
    delayTime: 3.5,
    depth: 0.7
  },
  chord: {
    octaves: 2, // Reduced from 3 to 2 to prevent too many simultaneous oscillators
    baseOctave: 4,
    duration: 3000,
    waveform: 'sine',
    envelope: {
      attack: 0.5,
      decay: 0.4,
      sustain: 0.7,
      release: 2.0
    },
    gain: 0.12, // Reduced from 0.25 to prevent clipping when multiple chords play
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
} as const;

// Pure function to create octave range
export const createOctaveRange = (octaves: number, baseOctave: number): number[] => {
  const halfRange = Math.floor(octaves / 2);
  const startOctave = baseOctave - halfRange;
  
  return Array.from(
    { length: octaves },
    (_, index) => startOctave + index
  );
};

// Pure function to validate audio configuration
export const validateAudioConfig = (config: AudioConfig): boolean => {
  const isValidOctaves = config.octaves > 0 && config.octaves <= 7;
  const isValidBaseOctave = config.baseOctave >= 0 && config.baseOctave <= 8;
  const isValidDuration = config.duration > 0;
  const isValidEnvelope = config.envelope.attack >= 0 && 
                         config.envelope.decay >= 0 && 
                         config.envelope.sustain >= 0 && config.envelope.sustain <= 1 &&
                         config.envelope.release >= 0;
  const isValidGain = config.gain >= 0 && config.gain <= 1;
  const isValidReverb = config.reverb.roomSize >= 0 && config.reverb.roomSize <= 1 && 
                       config.reverb.wet >= 0 && config.reverb.wet <= 1;
  const isValidChorus = config.chorus.frequency > 0 && 
                       config.chorus.delayTime > 0 && 
                       config.chorus.depth >= 0 && config.chorus.depth <= 1;
  
  // Chord validation
  const isValidChordOctaves = config.chord.octaves > 0 && config.chord.octaves <= 7;
  const isValidChordBaseOctave = config.chord.baseOctave >= 0 && config.chord.baseOctave <= 8;
  const isValidChordDuration = config.chord.duration > 0;
  const isValidChordEnvelope = config.chord.envelope.attack >= 0 && 
                              config.chord.envelope.decay >= 0 && 
                              config.chord.envelope.sustain >= 0 && config.chord.envelope.sustain <= 1 &&
                              config.chord.envelope.release >= 0;
  const isValidChordGain = config.chord.gain >= 0 && config.chord.gain <= 1;
  const isValidChordReverb = config.chord.reverb.roomSize >= 0 && config.chord.reverb.roomSize <= 1 && 
                            config.chord.reverb.wet >= 0 && config.chord.reverb.wet <= 1;
  const isValidChordChorus = config.chord.chorus.frequency > 0 && 
                            config.chord.chorus.delayTime > 0 && 
                            config.chord.chorus.depth >= 0 && config.chord.chorus.depth <= 1;
  const isValidChordStyle = ['simultaneous', 'arpeggio', 'roll'].includes(config.chord.style);
  const isValidChordDelays = config.chord.arpeggioDelay > 0 && config.chord.rollDelay > 0;
  
  return isValidOctaves && isValidBaseOctave && isValidDuration && 
         isValidEnvelope && isValidGain && isValidReverb && isValidChorus &&
         isValidChordOctaves && isValidChordBaseOctave && isValidChordDuration &&
         isValidChordEnvelope && isValidChordGain && isValidChordReverb && 
         isValidChordChorus && isValidChordStyle && isValidChordDelays;
};

// Pure function to create a new config with updated values
export const updateAudioConfig = (
  config: AudioConfig,
  updates: Partial<AudioConfig>
): AudioConfig => ({
  ...config,
  ...updates,
  envelope: { ...config.envelope, ...updates.envelope },
  reverb: { ...config.reverb, ...updates.reverb },
  chorus: { ...config.chorus, ...updates.chorus },
  chord: {
    ...config.chord,
    ...updates.chord,
    envelope: { ...config.chord.envelope, ...updates.chord?.envelope },
    reverb: { ...config.chord.reverb, ...updates.chord?.reverb },
    chorus: { ...config.chord.chorus, ...updates.chord?.chorus }
  }
});