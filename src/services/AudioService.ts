// Pure AudioService class - No React dependencies
// Handles all Tone.js audio operations and voice lifecycle management

import * as Tone from 'tone';
import type { AudioConfig, IAudioService } from '../types/audio';
import { generateOctaveFrequencies, normalizeNoteName, calculateFrequency } from '../utils/musicalNotes';
import { getTouchCapabilities } from '../utils/deviceDetection';
import { getChordVoicing, type VoicedNote } from '../utils/voicing';
import {
  createVoice,
  createEffectsChain,
  disposeVoice,
  disposeEffects,
  applyDynamicGain,
  type SynthVoice,
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
  private activeVoices = new Set<string>();
  private deviceCapabilities = getTouchCapabilities();
  private deviceOptions: DeviceOptions = { isIOS: getTouchCapabilities().isIOS };

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
    this.activeVoices.delete(voiceId);
    this.updateMasterGain();
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

  // Play a chord (multiple notes)
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
      
      const uniqueNotes = [...new Set(noteNames.map(note => normalizeNoteName(note)))];
      console.log('🎵 AudioService: Playing chord with unique notes:', uniqueNotes);
      
      // Calculate voicing to distribute notes across octaves
      const voicedNotes = getChordVoicing(uniqueNotes);
      console.log('🎵 AudioService: Voicing:', voicedNotes);
      
      // Create effects chain for chord using the Synthesizer module
      const chordEffects = createEffectsChain(
        { reverb: chordConfig.reverb, chorus: chordConfig.chorus },
        this.deviceOptions
      );
      
      const playVoicedNoteAtTime = (voicedNote: VoicedNote, delayMs: number = 0) => {
        const { note, relativeOctave } = voicedNote;
        
        // Calculate octaves for this specific note based on voicing
        // We shift the base octave by the relative octave determined by the voicing logic
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
          
          // Create voice using the Synthesizer module
          const voice = createVoice(frequency, {
            waveform: chordConfig.waveform,
            envelope: chordConfig.envelope,
            gain: chordConfig.gain
          });
          
          voice.gainNode.connect(chordEffects.gain);
          this.voices.set(voiceId, voice);
          this.activeVoices.add(voiceId);
          this.updateMasterGain();
          
          voice.oscillator.start();
          
          if (chordConfig.style === 'simultaneous') {
            voice.envelope.triggerAttackRelease(chordConfig.duration / 1000);
          } else {
            setTimeout(() => {
              voice.envelope.triggerAttackRelease(chordConfig.duration / 1000);
            }, delayMs);
          }
          
          setTimeout(() => {
            this.cleanupVoice(voiceId);
          }, chordConfig.duration + 2000);
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
