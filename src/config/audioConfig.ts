// Audio configuration for Tree of Life sound feature
// Functional approach with immutable configuration objects

import { AudioConfig } from '../types/audio';

// Re-export the type
export type { AudioConfig };

// Default configuration - immutable object
export const defaultAudioConfig: AudioConfig = {
  octaves: 3,
  baseOctave: 4,
  duration: 2000,
  waveform: 'sine',
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
  decay: {
    type: 'exponential',
    time: 1.5
  }
} as const;

// Pure function to create octave range
export const createOctaveRange = (octaves: number, baseOctave: number): number[] => {
  const halfRange = Math.floor(octaves / 2);
  const startOctave = baseOctave - halfRange;
  const endOctave = baseOctave + halfRange;
  
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
  const isValidReverb = config.reverb.roomSize >= 0 && config.reverb.roomSize <= 1 && 
                       config.reverb.wet >= 0 && config.reverb.wet <= 1;
  const isValidChorus = config.chorus.frequency > 0 && 
                       config.chorus.delayTime > 0 && 
                       config.chorus.depth >= 0 && config.chorus.depth <= 1;
  const isValidDecay = config.decay.time > 0;
  
  return isValidOctaves && isValidBaseOctave && isValidDuration && 
         isValidReverb && isValidChorus && isValidDecay;
};

// Pure function to create a new config with updated values
export const updateAudioConfig = (
  config: AudioConfig,
  updates: Partial<AudioConfig>
): AudioConfig => ({
  ...config,
  ...updates,
  reverb: { ...config.reverb, ...updates.reverb },
  chorus: { ...config.chorus, ...updates.chorus },
  decay: { ...config.decay, ...updates.decay }
});