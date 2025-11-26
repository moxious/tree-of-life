// Pure AudioService class - No React dependencies
// Handles all Tone.js audio operations and voice lifecycle management

import * as Tone from 'tone';
import type { AudioConfig, IAudioService } from '../types/audio';
import type { SynthPreset } from '../types/synthPresets';
import { generateOctaveFrequencies, normalizeNoteName, calculateFrequency } from '../utils/musicalNotes';
import { getTouchCapabilities } from '../utils/deviceDetection';
import { getChordVoicing, type VoicedNote } from '../utils/voicing';
import { getPreset, DEFAULT_PRESET_ID } from '../config/synthPresets';
import {
  createVoice,
  createEffectsChain,
  createVoiceFromPreset,
  disposeVoice,
  disposeEffects,
  disposePolymorphicVoice,
  triggerPolymorphicAttackRelease,
  applyDynamicGain,
  type SynthVoice,
  type PolymorphicVoice,
  type EffectsChain,
  type DeviceOptions
} from './Synthesizer';

// Maximum number of simultaneous voices to prevent clipping
const MAX_SIMULTANEOUS_VOICES = 12;
const MAX_SIMULTANEOUS_VOICES_IOS = 8; // Lower limit for iOS devices

export class AudioService implements IAudioService {
  private isInitializedFlag = false;
  private effects: EffectsChain | null = null;
  private voices = new Map<string, SynthVoice>();
  private polymorphicVoices = new Map<string, PolymorphicVoice>();
  private activeVoices = new Set<string>();
  private deviceCapabilities = getTouchCapabilities();
  private deviceOptions: DeviceOptions = { isIOS: getTouchCapabilities().isIOS };
  private currentPreset: SynthPreset = getPreset(DEFAULT_PRESET_ID);
  private currentPresetId: string = DEFAULT_PRESET_ID;

  // Pure function to create octave range
  private createOctaveRange(octaves: number, baseOctave: number): number[] {
    const halfRange = Math.floor(octaves / 2);
    const startOctave = baseOctave - halfRange;
    
    return Array.from(
      { length: octaves },
      (_, index) => startOctave + index
    );
  }

  // Pure function to calculate voice ID for tracking
  private createVoiceId(noteName: string, octave: number, timestamp: number): string {
    return `${noteName}-${octave}-${timestamp}`;
  }

  // Pure function to update master gain based on active voices
  private updateMasterGain(): void {
    if (this.effects) {
      applyDynamicGain(this.effects, this.activeVoices.size, this.deviceOptions);
    }
  }

  // Pure function to cleanup a specific voice
  private cleanupVoice(voiceId: string): void {
    const voice = this.voices.get(voiceId);
    if (voice) {
      disposeVoice(voice);
      this.voices.delete(voiceId);
    }
    
    // Also check for polymorphic voices
    const polyVoice = this.polymorphicVoices.get(voiceId);
    if (polyVoice) {
      disposePolymorphicVoice(polyVoice);
      this.polymorphicVoices.delete(voiceId);
    }
    
    this.activeVoices.delete(voiceId);
    this.updateMasterGain();
  }

  // Set the current synth preset
  setPreset(presetId: string): void {
    this.currentPresetId = presetId;
    this.currentPreset = getPreset(presetId);
    console.log('🎵 AudioService: Preset changed to:', this.currentPreset.name);
  }

  // Get the current preset ID
  getCurrentPresetId(): string {
    return this.currentPresetId;
  }

  // Initialize audio context
  async initialize(): Promise<boolean> {
    try {
      if (this.deviceCapabilities.isIOS) {
        console.log('🎵 AudioService: Device capabilities:', this.deviceCapabilities);
      }
      
      await Tone.start();
      this.isInitializedFlag = true;
      return true;
    } catch (error) {
      console.error('🎵 AudioService: Error initializing audio:', error);
      return false;
    }
  }

  // Play a musical note
  async playNote(noteName: string, config: AudioConfig): Promise<void> {
    if (!this.isInitializedFlag) {
      await this.initialize();
    }

    if (!this.effects) {
      this.effects = createEffectsChain(config, this.deviceOptions);
    }

    try {
      const normalizedNote = normalizeNoteName(noteName);
      const octaves = this.createOctaveRange(config.octaves, config.baseOctave);
      const frequencies = generateOctaveFrequencies(normalizedNote, octaves);
      const timestamp = Date.now();
      
      frequencies.forEach((frequency, index) => {
        const octave = octaves[index];
        const voiceId = this.createVoiceId(normalizedNote, octave, timestamp);
        
        const voice = createVoice(frequency, {
          waveform: config.waveform,
          envelope: config.envelope,
          gain: config.gain
        });
        voice.gainNode.connect(this.effects!.gain);
        
        this.voices.set(voiceId, voice);
        this.activeVoices.add(voiceId);
        this.updateMasterGain();
        
        voice.oscillator.start();
        voice.envelope.triggerAttackRelease(config.duration / 1000);
        
        // Clean up after duration
        setTimeout(() => {
          this.cleanupVoice(voiceId);
        }, config.duration + 1000);
      });
    } catch (error) {
      console.error('🎵 AudioService: Error in playNote:', error);
      throw error;
    }
  }

  // Play a chord (multiple notes) using the current synth preset
  async playChord(noteNames: string[], config: AudioConfig): Promise<void> {
    if (!this.isInitializedFlag) {
      await this.initialize();
    }

    if (noteNames.length === 0) {
      console.log('🎵 AudioService: No notes to play');
      return;
    }

    try {
      const chordConfig = config.chord;
      const timestamp = Date.now();
      const preset = this.currentPreset;
      
      const uniqueNotes = [...new Set(noteNames.map(note => normalizeNoteName(note)))];
      console.log('🎵 AudioService: Playing chord with preset:', preset.name, 'notes:', uniqueNotes);
      
      // Calculate voicing to distribute notes across octaves
      const voicedNotes = getChordVoicing(uniqueNotes);
      console.log('🎵 AudioService: Voicing:', voicedNotes);
      
      // Create effects chain using preset effects configuration
      const chordEffects = createEffectsChain(
        { reverb: preset.effects.reverb, chorus: preset.effects.chorus },
        this.deviceOptions
      );
      
      const playVoicedNoteAtTime = (voicedNote: VoicedNote, delayMs: number = 0) => {
        const { note, relativeOctave } = voicedNote;
        
        // Calculate octaves for this specific note based on voicing
        const noteBaseOctave = chordConfig.baseOctave + relativeOctave;
        const octaves = this.createOctaveRange(chordConfig.octaves, noteBaseOctave);
        
        // Generate frequencies for each octave layer of this note
        const frequencies = octaves.map(oct => calculateFrequency(note, oct));
        
        frequencies.forEach((frequency, index) => {
          const maxVoices = this.deviceCapabilities.isIOS ? MAX_SIMULTANEOUS_VOICES_IOS : MAX_SIMULTANEOUS_VOICES;
          if (this.activeVoices.size >= maxVoices) {
            console.log(`🎵 AudioService: Maximum voices (${maxVoices}) reached, skipping`);
            return;
          }
          
          const octave = octaves[index];
          const voiceId = this.createVoiceId(`${note}-chord`, octave, timestamp + delayMs);
          
          // Create polymorphic voice using the preset
          const polyVoice = createVoiceFromPreset(preset, frequency);
          
          // Connect to effects chain
          polyVoice.gainNode.connect(chordEffects.gain);
          this.polymorphicVoices.set(voiceId, polyVoice);
          this.activeVoices.add(voiceId);
          this.updateMasterGain();
          
          // Trigger the voice with preset envelope timing
          const duration = preset.envelope.attack + preset.envelope.decay + 
                          (chordConfig.duration / 1000) + preset.envelope.release;
          
          if (chordConfig.style === 'simultaneous') {
            triggerPolymorphicAttackRelease(polyVoice, frequency, chordConfig.duration / 1000);
          } else {
            setTimeout(() => {
              triggerPolymorphicAttackRelease(polyVoice, frequency, chordConfig.duration / 1000);
            }, delayMs);
          }
          
          // Schedule cleanup after full envelope completes
          setTimeout(() => {
            this.cleanupVoice(voiceId);
          }, (duration * 1000) + delayMs + 500);
        });
      };
      
      // Play notes based on chord style using voiced notes
      if (chordConfig.style === 'simultaneous') {
        voicedNotes.forEach(voicedNote => playVoicedNoteAtTime(voicedNote));
      } else if (chordConfig.style === 'arpeggio') {
        voicedNotes.forEach((voicedNote, index) => {
          playVoicedNoteAtTime(voicedNote, index * chordConfig.arpeggioDelay);
        });
      } else if (chordConfig.style === 'roll') {
        voicedNotes.forEach((voicedNote, index) => {
          playVoicedNoteAtTime(voicedNote, index * chordConfig.rollDelay);
        });
      }
    } catch (error) {
      console.error('🎵 AudioService: Error in playChord:', error);
      throw error;
    }
  }

  // Stop all voices
  stopAllVoices(): void {
    this.voices.forEach((voice) => {
      disposeVoice(voice);
    });
    this.voices.clear();
    
    this.polymorphicVoices.forEach((voice) => {
      disposePolymorphicVoice(voice);
    });
    this.polymorphicVoices.clear();
    
    this.activeVoices.clear();
  }

  // Cleanup all resources
  cleanup(): void {
    this.stopAllVoices();
    if (this.effects) {
      disposeEffects(this.effects);
      this.effects = null;
    }
    this.isInitializedFlag = false;
  }

  // Check if initialized
  isInitialized(): boolean {
    return this.isInitializedFlag;
  }
}
