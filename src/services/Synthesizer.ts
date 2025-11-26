// Synthesizer Module - Modular synth voice and effects chain creation
// Pure factory functions for creating Tone.js synthesizer components

import * as Tone from 'tone';
import type {
  SynthPreset,
  FMEngineConfig,
  LayeredEngineConfig,
  OscillatorEngineConfig
} from '../types/synthPresets';

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

// Polymorphic voice that can hold different synth engine types
export interface PolymorphicVoice {
  readonly voices: Array<{
    synth: Tone.Synth | Tone.FMSynth;
    envelope?: Tone.Envelope;
  }>;
  readonly filter?: Tone.Filter;
  readonly gainNode: Tone.Gain;
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

// ============================================================================
// Preset-Based Voice Creation
// ============================================================================

/**
 * Creates a polymorphic voice from a synth preset
 * Supports oscillator, FM, and layered engine types
 */
export const createVoiceFromPreset = (
  preset: SynthPreset,
  frequency: number
): PolymorphicVoice => {
  const gainNode = new Tone.Gain(0.3);
  const voices: PolymorphicVoice['voices'] = [];
  let filter: Tone.Filter | undefined;

  // Create filter if specified
  if (preset.filter) {
    filter = new Tone.Filter({
      type: preset.filter.type,
      frequency: preset.filter.frequency,
      Q: preset.filter.Q
    });
  }

  const config = preset.engineConfig;

  if (config.type === 'fm') {
    // FM Synthesis
    const fmConfig = config as FMEngineConfig;
    const synth = new Tone.FMSynth({
      harmonicity: fmConfig.harmonicity,
      modulationIndex: fmConfig.modulationIndex,
      oscillator: { type: fmConfig.oscillatorType },
      modulation: { type: fmConfig.modulationType },
      envelope: {
        attack: preset.envelope.attack,
        decay: preset.envelope.decay,
        sustain: preset.envelope.sustain,
        release: preset.envelope.release
      },
      modulationEnvelope: {
        attack: fmConfig.modulationEnvelope.attack,
        decay: fmConfig.modulationEnvelope.decay,
        sustain: fmConfig.modulationEnvelope.sustain,
        release: fmConfig.modulationEnvelope.release
      }
    });
    synth.frequency.value = frequency;
    
    if (filter) {
      synth.connect(filter);
      filter.connect(gainNode);
    } else {
      synth.connect(gainNode);
    }
    
    voices.push({ synth });
  } else if (config.type === 'layered') {
    // Layered Oscillators
    const layeredConfig = config as LayeredEngineConfig;
    
    layeredConfig.layers.forEach(layer => {
      // Calculate frequency with octave shift
      const layerFrequency = frequency * Math.pow(2, layer.octaveShift);
      
      const synth = new Tone.Synth({
        oscillator: { type: layer.waveform },
        envelope: {
          attack: preset.envelope.attack,
          decay: preset.envelope.decay,
          sustain: preset.envelope.sustain,
          release: preset.envelope.release
        }
      });
      
      // Apply detune (in cents)
      synth.detune.value = layer.detune;
      synth.frequency.value = layerFrequency;
      
      // Create individual gain for layer mixing
      const layerGain = new Tone.Gain(layer.gain);
      synth.connect(layerGain);
      
      if (filter) {
        layerGain.connect(filter);
      } else {
        layerGain.connect(gainNode);
      }
      
      voices.push({ synth });
    });
    
    // Connect filter to output if present
    if (filter) {
      filter.connect(gainNode);
    }
  } else {
    // Basic Oscillator
    const oscConfig = config as OscillatorEngineConfig;
    const synth = new Tone.Synth({
      oscillator: { type: oscConfig.waveform },
      envelope: {
        attack: preset.envelope.attack,
        decay: preset.envelope.decay,
        sustain: preset.envelope.sustain,
        release: preset.envelope.release
      }
    });
    synth.frequency.value = frequency;
    
    if (filter) {
      synth.connect(filter);
      filter.connect(gainNode);
    } else {
      synth.connect(gainNode);
    }
    
    voices.push({ synth });
  }

  return { voices, filter, gainNode };
};

/**
 * Triggers attack on a polymorphic voice
 */
export const triggerPolymorphicAttack = (voice: PolymorphicVoice, frequency: number): void => {
  voice.voices.forEach(v => {
    if (v.synth instanceof Tone.FMSynth) {
      v.synth.triggerAttack(frequency);
    } else {
      v.synth.triggerAttack(frequency);
    }
  });
};

/**
 * Triggers attack and release on a polymorphic voice
 */
export const triggerPolymorphicAttackRelease = (
  voice: PolymorphicVoice,
  frequency: number,
  duration: number | string
): void => {
  voice.voices.forEach(v => {
    v.synth.triggerAttackRelease(frequency, duration);
  });
};

/**
 * Disposes of a polymorphic voice and releases its resources
 */
export const disposePolymorphicVoice = (voice: PolymorphicVoice): void => {
  voice.voices.forEach(v => {
    v.synth.dispose();
    if (v.envelope) {
      v.envelope.dispose();
    }
  });
  if (voice.filter) {
    voice.filter.dispose();
  }
  voice.gainNode.dispose();
};

