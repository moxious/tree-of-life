// Synth Preset Types - Defines engine types and preset structures
// Used by Synthesizer.ts to create polymorphic voices

import type { EnvelopeConfig, ReverbConfig, ChorusConfig } from '../services/Synthesizer';

// ============================================================================
// Synth Engine Types
// ============================================================================

export type SynthEngine = 'oscillator' | 'fm' | 'layered';

export type OscillatorType = 'sine' | 'triangle' | 'sawtooth' | 'square';

// ============================================================================
// Engine Configuration Types
// ============================================================================

export interface OscillatorEngineConfig {
  readonly type: 'oscillator';
  readonly waveform: OscillatorType;
}

export interface FMEngineConfig {
  readonly type: 'fm';
  readonly harmonicity: number;
  readonly modulationIndex: number;
  readonly oscillatorType: OscillatorType;
  readonly modulationType: OscillatorType;
  readonly modulationEnvelope: EnvelopeConfig;
}

export interface OscillatorLayer {
  readonly waveform: OscillatorType;
  readonly detune: number;      // cents (-100 to 100 typical)
  readonly gain: number;        // relative volume (0-1)
  readonly octaveShift: number; // octave offset (-2 to 2 typical)
}

export interface LayeredEngineConfig {
  readonly type: 'layered';
  readonly layers: ReadonlyArray<OscillatorLayer>;
}

// Union type for all engine configurations
export type EngineConfig = OscillatorEngineConfig | FMEngineConfig | LayeredEngineConfig;

// ============================================================================
// Filter Configuration
// ============================================================================

export interface FilterConfig {
  readonly type: 'lowpass' | 'highpass' | 'bandpass' | 'notch';
  readonly frequency: number;
  readonly Q: number;
}

// ============================================================================
// Synth Preset
// ============================================================================

export type PresetCategory = 'keys' | 'pads' | 'bells' | 'strings' | 'bass' | 'leads' | 'percussion';

export interface SynthPreset {
  readonly id: string;
  readonly name: string;
  readonly category: PresetCategory;
  readonly engine: SynthEngine;
  readonly engineConfig: EngineConfig;
  readonly filter?: FilterConfig;
  readonly envelope: EnvelopeConfig;
  readonly effects: {
    readonly reverb: ReverbConfig;
    readonly chorus: ChorusConfig;
  };
}

// ============================================================================
// Helper type guards
// ============================================================================

export const isOscillatorConfig = (config: EngineConfig): config is OscillatorEngineConfig =>
  config.type === 'oscillator';

export const isFMConfig = (config: EngineConfig): config is FMEngineConfig =>
  config.type === 'fm';

export const isLayeredConfig = (config: EngineConfig): config is LayeredEngineConfig =>
  config.type === 'layered';

