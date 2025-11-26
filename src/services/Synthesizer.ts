// Synthesizer Module - Modular synth voice and effects chain creation
// Pure factory functions for creating Tone.js synthesizer components

import * as Tone from 'tone';

// ============================================================================
// Types
// ============================================================================

export interface SynthVoice {
  oscillator: Tone.Oscillator;
  envelope: Tone.Envelope;
  gainNode: Tone.Gain;
}

export interface EffectsChain {
  chorus: Tone.Chorus;
  reverb: Tone.Reverb;
  gain: Tone.Gain;
  limiter: Tone.Limiter;
}

export interface EnvelopeConfig {
  readonly attack: number;
  readonly decay: number;
  readonly sustain: number;
  readonly release: number;
}

export interface ReverbConfig {
  readonly enabled: boolean;
  readonly roomSize: number;
  readonly wet: number;
}

export interface ChorusConfig {
  readonly enabled: boolean;
  readonly frequency: number;
  readonly delayTime: number;
  readonly depth: number;
}

export interface VoiceConfig {
  readonly waveform: 'sine' | 'triangle' | 'sawtooth' | 'square';
  readonly envelope: EnvelopeConfig;
  readonly gain: number;
}

export interface EffectsConfig {
  readonly reverb: ReverbConfig;
  readonly chorus: ChorusConfig;
}

export interface DeviceOptions {
  readonly isIOS: boolean;
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Creates a synth voice with oscillator, envelope, and gain node
 * Pure factory function - caller is responsible for connecting and starting
 */
export const createVoice = (frequency: number, config: VoiceConfig): SynthVoice => {
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

  const gainNode = new Tone.Gain(config.gain);
  
  // Internal voice routing: oscillator → gainNode, envelope → gain control
  oscillator.connect(gainNode);
  envelope.connect(gainNode.gain);

  return { oscillator, envelope, gainNode };
};

/**
 * Creates an effects chain with chorus, reverb, gain, and limiter
 * Chain: chorus → reverb → gain → limiter → destination
 */
export const createEffectsChain = (
  config: EffectsConfig,
  options: DeviceOptions = { isIOS: false }
): EffectsChain => {
  const { isIOS } = options;

  // iOS-specific optimizations for performance
  const chorus = new Tone.Chorus({
    frequency: config.chorus.frequency,
    delayTime: config.chorus.delayTime,
    depth: config.chorus.depth,
    wet: config.chorus.enabled ? (isIOS ? 0.5 : 1) : 0
  });

  const reverb = new Tone.Reverb({
    decay: config.reverb.roomSize,
    wet: config.reverb.enabled ? (isIOS ? config.reverb.wet * 0.7 : config.reverb.wet) : 0
  });

  // iOS devices may need lower gain to prevent clipping
  const masterGain = isIOS ? 0.15 : 0.2;
  const gain = new Tone.Gain(masterGain);

  // More aggressive limiting on iOS
  const limiterThreshold = isIOS ? -6 : -3;
  const limiter = new Tone.Limiter(limiterThreshold);

  // Chain: chorus → reverb → gain → limiter → destination
  chorus.connect(reverb);
  reverb.connect(gain);
  gain.connect(limiter);
  limiter.toDestination();

  return { chorus, reverb, gain, limiter };
};

/**
 * Connects a voice to an effects chain
 * Voice gainNode → effects chain gain (bypasses chorus/reverb for direct connection)
 */
export const connectVoiceToEffects = (voice: SynthVoice, effects: EffectsChain): void => {
  voice.gainNode.connect(effects.gain);
};

/**
 * Connects a voice to the full effects chain (including chorus/reverb)
 * Voice gainNode → chorus (start of effects chain)
 */
export const connectVoiceToFullEffectsChain = (voice: SynthVoice, effects: EffectsChain): void => {
  voice.gainNode.connect(effects.chorus);
};

/**
 * Disposes of a synth voice and releases its resources
 */
export const disposeVoice = (voice: SynthVoice): void => {
  voice.oscillator.stop();
  voice.oscillator.dispose();
  voice.envelope.dispose();
  voice.gainNode.dispose();
};

/**
 * Disposes of an effects chain and releases its resources
 */
export const disposeEffects = (effects: EffectsChain): void => {
  effects.chorus.dispose();
  effects.reverb.dispose();
  effects.gain.dispose();
  effects.limiter.dispose();
};

/**
 * Updates master gain based on active voice count
 * Returns the calculated gain value
 */
export const calculateDynamicGain = (
  activeVoiceCount: number,
  options: DeviceOptions = { isIOS: false }
): number => {
  const { isIOS } = options;
  const baseGain = isIOS ? 0.15 : 0.2;
  const reductionPerVoice = isIOS ? 0.03 : 0.02;
  return Math.max(0.05, baseGain - (activeVoiceCount - 1) * reductionPerVoice);
};

/**
 * Applies dynamic gain to an effects chain
 */
export const applyDynamicGain = (
  effects: EffectsChain,
  activeVoiceCount: number,
  options: DeviceOptions = { isIOS: false }
): void => {
  effects.gain.gain.value = calculateDynamicGain(activeVoiceCount, options);
};

