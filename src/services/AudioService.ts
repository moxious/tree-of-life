// Pure AudioService class - No React dependencies
// Handles all Tone.js audio operations

import * as Tone from 'tone';
import type { AudioConfig, IAudioService, Voice } from '../types/audio';
import { generateOctaveFrequencies, normalizeNoteName } from '../utils/musicalNotes';

// Maximum number of simultaneous voices to prevent clipping
const MAX_SIMULTANEOUS_VOICES = 12;

export class AudioService implements IAudioService {
  private isInitializedFlag = false;
  private effects: {
    chorus: Tone.Chorus;
    reverb: Tone.Reverb;
    gain: Tone.Gain;
    limiter: Tone.Limiter;
  } | null = null;
  private voices = new Map<string, Voice>();
  private activeVoices = new Set<string>();

  // Pure function to create octave range
  private createOctaveRange(octaves: number, baseOctave: number): number[] {
    const halfRange = Math.floor(octaves / 2);
    const startOctave = baseOctave - halfRange;
    
    return Array.from(
      { length: octaves },
      (_, index) => startOctave + index
    );
  }

  // Pure function to create audio effects chain
  private createEffectsChain(config: AudioConfig) {
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

    const gain = new Tone.Gain(0.2); // Master volume control
    const limiter = new Tone.Limiter(-3); // Limit to -3dB to prevent clipping

    // Chain: chorus -> reverb -> gain -> limiter -> destination
    chorus.connect(reverb);
    reverb.connect(gain);
    gain.connect(limiter);
    limiter.toDestination();

    return { chorus, reverb, gain, limiter };
  }

  // Pure function to create oscillator for a specific frequency
  private createOscillator(frequency: number, config: AudioConfig): Voice {
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
    oscillator.connect(gainNode);
    envelope.connect(gainNode.gain);

    return { oscillator, envelope, gainNode };
  }

  // Pure function to calculate voice ID for tracking
  private createVoiceId(noteName: string, octave: number, timestamp: number): string {
    return `${noteName}-${octave}-${timestamp}`;
  }

  // Pure function to update master gain based on active voices
  private updateMasterGain(): void {
    if (this.effects) {
      const activeVoiceCount = this.activeVoices.size;
      const dynamicGain = Math.max(0.05, 0.2 - (activeVoiceCount - 1) * 0.02);
      this.effects.gain.gain.value = dynamicGain;
    }
  }

  // Pure function to cleanup a specific voice
  private cleanupVoice(voiceId: string): void {
    const voice = this.voices.get(voiceId);
    if (voice) {
      voice.oscillator.stop();
      voice.oscillator.dispose();
      voice.envelope.dispose();
      voice.gainNode.dispose();
      this.voices.delete(voiceId);
    }
    this.activeVoices.delete(voiceId);
    this.updateMasterGain();
  }

  // Initialize audio context
  async initialize(): Promise<boolean> {
    try {
      console.log('🎵 AudioService: Starting Tone.start()...');
      await Tone.start();
      console.log('🎵 AudioService: Tone.start() completed successfully');
      this.isInitializedFlag = true;
      console.log('🎵 AudioService: Audio context initialized');
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
      this.effects = this.createEffectsChain(config);
    }

    try {
      const normalizedNote = normalizeNoteName(noteName);
      const octaves = this.createOctaveRange(config.octaves, config.baseOctave);
      const frequencies = generateOctaveFrequencies(normalizedNote, octaves);
      const timestamp = Date.now();
      
      frequencies.forEach((frequency, index) => {
        const octave = octaves[index];
        const voiceId = this.createVoiceId(normalizedNote, octave, timestamp);
        
        const voice = this.createOscillator(frequency, config);
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
    console.log('🎵 AudioService: playChord called with notes:', noteNames);
    
    if (!this.isInitializedFlag) {
      console.log('🎵 AudioService: Not initialized, initializing...');
      await this.initialize();
    }

    if (noteNames.length === 0) {
      console.log('🎵 AudioService: No notes to play');
      return;
    }

    try {
      const chordConfig = config.chord;
      const octaves = this.createOctaveRange(chordConfig.octaves, chordConfig.baseOctave);
      const timestamp = Date.now();
      
      const uniqueNotes = [...new Set(noteNames.map(note => normalizeNoteName(note)))];
      console.log('🎵 AudioService: Playing chord with unique notes:', uniqueNotes);
      
      // Create effects chain for chord
      const chordEffects = this.createEffectsChain({
        ...config,
        reverb: chordConfig.reverb,
        chorus: chordConfig.chorus
      });
      console.log('🎵 AudioService: Chord effects chain created');
      
      const playNoteAtTime = (noteName: string, delayMs: number = 0) => {
        const frequencies = generateOctaveFrequencies(noteName, octaves);
        console.log(`🎵 AudioService: Playing note ${noteName} with frequencies:`, frequencies);
        
        frequencies.forEach((frequency, index) => {
          if (this.activeVoices.size >= MAX_SIMULTANEOUS_VOICES) {
            console.log(`🎵 AudioService: Maximum voices (${MAX_SIMULTANEOUS_VOICES}) reached, skipping`);
            return;
          }
          
          const octave = octaves[index];
          const voiceId = this.createVoiceId(`${noteName}-chord`, octave, timestamp + delayMs);
          // console.log(`🎵 AudioService: Creating chord oscillator for ${noteName}${octave} at ${frequency}Hz`);
          
          const voice = this.createOscillator(frequency, {
            ...config,
            ...chordConfig
          });
          
          voice.gainNode.connect(chordEffects.gain);
          this.voices.set(voiceId, voice);
          this.activeVoices.add(voiceId);
          this.updateMasterGain();
          
          voice.oscillator.start();
          console.log(`🎵 AudioService: Oscillator started for ${voiceId}`);
          
          if (chordConfig.style === 'simultaneous') {
            voice.envelope.triggerAttackRelease(chordConfig.duration / 1000);
            // console.log(`🎵 AudioService: Envelope triggered for ${voiceId}`);
          } else {
            setTimeout(() => {
              voice.envelope.triggerAttackRelease(chordConfig.duration / 1000);
              // console.log(`🎵 AudioService: Envelope triggered (delayed) for ${voiceId}`);
            }, delayMs);
          }
          
          setTimeout(() => {
            this.cleanupVoice(voiceId);
          }, chordConfig.duration + 2000);
        });
      };
      
      // Play notes based on chord style
      if (chordConfig.style === 'simultaneous') {
        uniqueNotes.forEach(noteName => playNoteAtTime(noteName));
      } else if (chordConfig.style === 'arpeggio') {
        uniqueNotes.forEach((noteName, index) => {
          playNoteAtTime(noteName, index * chordConfig.arpeggioDelay);
        });
      } else if (chordConfig.style === 'roll') {
        uniqueNotes.forEach((noteName, index) => {
          playNoteAtTime(noteName, index * chordConfig.rollDelay);
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
      voice.oscillator.stop();
      voice.oscillator.dispose();
      voice.envelope.dispose();
      voice.gainNode.dispose();
    });
    this.voices.clear();
    this.activeVoices.clear();
  }

  // Cleanup all resources
  cleanup(): void {
    this.stopAllVoices();
    if (this.effects) {
      this.effects.chorus.dispose();
      this.effects.reverb.dispose();
      this.effects.gain.dispose();
      this.effects.limiter.dispose();
      this.effects = null;
    }
    this.isInitializedFlag = false;
  }

  // Check if initialized
  isInitialized(): boolean {
    return this.isInitializedFlag;
  }
}
