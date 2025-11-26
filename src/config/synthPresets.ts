// Synth Presets Library - Preset definitions for different synth timbres
// Each preset defines an engine type, configuration, and effects chain

import type { SynthPreset } from '../types/synthPresets';

// ============================================================================
// Preset Definitions
// ============================================================================

export const SYNTH_PRESETS: Record<string, SynthPreset> = {
  // Warm, meditative pad - detuned sine/triangle layers
  'celestial-pad': {
    id: 'celestial-pad',
    name: 'Celestial Pad',
    category: 'pads',
    engine: 'layered',
    engineConfig: {
      type: 'layered',
      layers: [
        { waveform: 'sine', detune: -5, gain: 0.4, octaveShift: 0 },
        { waveform: 'sine', detune: 5, gain: 0.4, octaveShift: 0 },
        { waveform: 'triangle', detune: 0, gain: 0.3, octaveShift: 1 },
      ]
    },
    filter: {
      type: 'lowpass',
      frequency: 2000,
      Q: 1
    },
    envelope: {
      attack: 0.8,
      decay: 0.5,
      sustain: 0.8,
      release: 2.0
    },
    effects: {
      reverb: { enabled: true, roomSize: 4, wet: 0.6 },
      chorus: { enabled: true, frequency: 0.5, delayTime: 3.5, depth: 0.7 }
    }
  },

  // Bright, percussive bells - FM synthesis with high harmonicity
  'crystal-bells': {
    id: 'crystal-bells',
    name: 'Crystal Bells',
    category: 'bells',
    engine: 'fm',
    engineConfig: {
      type: 'fm',
      harmonicity: 8,
      modulationIndex: 20,
      oscillatorType: 'sine',
      modulationType: 'sine',
      modulationEnvelope: {
        attack: 0.001,
        decay: 0.4,
        sustain: 0,
        release: 0.5
      }
    },
    envelope: {
      attack: 0.001,
      decay: 0.8,
      sustain: 0.1,
      release: 1.5
    },
    effects: {
      reverb: { enabled: true, roomSize: 5, wet: 0.7 },
      chorus: { enabled: false, frequency: 0, delayTime: 0, depth: 0 }
    }
  },

  // Rich, evolving strings - detuned sawtooth with filter
  'ethereal-strings': {
    id: 'ethereal-strings',
    name: 'Ethereal Strings',
    category: 'strings',
    engine: 'layered',
    engineConfig: {
      type: 'layered',
      layers: [
        { waveform: 'sawtooth', detune: -10, gain: 0.25, octaveShift: 0 },
        { waveform: 'sawtooth', detune: 0, gain: 0.3, octaveShift: 0 },
        { waveform: 'sawtooth', detune: 10, gain: 0.25, octaveShift: 0 },
        { waveform: 'sawtooth', detune: 0, gain: 0.2, octaveShift: 1 },
      ]
    },
    filter: {
      type: 'lowpass',
      frequency: 3000,
      Q: 0.7
    },
    envelope: {
      attack: 0.4,
      decay: 0.3,
      sustain: 0.7,
      release: 1.0
    },
    effects: {
      reverb: { enabled: true, roomSize: 3, wet: 0.4 },
      chorus: { enabled: true, frequency: 2, delayTime: 2.5, depth: 0.5 }
    }
  },

  // Deep, grounding bass - sine sub with harmonics
  'earth-bass': {
    id: 'earth-bass',
    name: 'Earth Bass',
    category: 'bass',
    engine: 'layered',
    engineConfig: {
      type: 'layered',
      layers: [
        { waveform: 'sine', detune: 0, gain: 0.6, octaveShift: -1 },
        { waveform: 'triangle', detune: 0, gain: 0.3, octaveShift: 0 },
        { waveform: 'sawtooth', detune: 0, gain: 0.1, octaveShift: 0 },
      ]
    },
    filter: {
      type: 'lowpass',
      frequency: 800,
      Q: 2
    },
    envelope: {
      attack: 0.05,
      decay: 0.3,
      sustain: 0.6,
      release: 0.8
    },
    effects: {
      reverb: { enabled: true, roomSize: 1.5, wet: 0.2 },
      chorus: { enabled: false, frequency: 0, delayTime: 0, depth: 0 }
    }
  }
};

// ============================================================================
// Preset Access Functions
// ============================================================================

/** Default preset ID */
export const DEFAULT_PRESET_ID = 'celestial-pad';

/** Get a preset by ID, falling back to default if not found */
export const getPreset = (id: string): SynthPreset =>
  SYNTH_PRESETS[id] ?? SYNTH_PRESETS[DEFAULT_PRESET_ID];

/** Get all presets as an array */
export const getAllPresets = (): SynthPreset[] =>
  Object.values(SYNTH_PRESETS);

/** Get presets filtered by category */
export const getPresetsByCategory = (category: string): SynthPreset[] =>
  Object.values(SYNTH_PRESETS).filter(p => p.category === category);

/** Get all preset IDs */
export const getPresetIds = (): string[] =>
  Object.keys(SYNTH_PRESETS);

