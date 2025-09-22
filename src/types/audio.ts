// Audio types for Tree of Life sound feature - Refactored for Context API

export interface NowPlayingEntry {
  id: string;
  source: string;        // "Keter (Below)" or "Path 22"
  notes: string[];       // ["C", "E", "G"]
  startTime: number;
  duration: number;
}

export interface AudioConfig {
  readonly octaves: number;
  readonly baseOctave: number;
  readonly duration: number;
  readonly waveform: 'sine' | 'triangle' | 'sawtooth' | 'square';
  readonly envelope: {
    readonly attack: number;
    readonly decay: number;
    readonly sustain: number;
    readonly release: number;
  };
  readonly gain: number;
  readonly reverb: {
    readonly enabled: boolean;
    readonly roomSize: number;
    readonly wet: number;
  };
  readonly chorus: {
    readonly enabled: boolean;
    readonly frequency: number;
    readonly delayTime: number;
    readonly depth: number;
  };
  readonly chord: {
    readonly octaves: number;
    readonly baseOctave: number;
    readonly duration: number;
    readonly waveform: 'sine' | 'triangle' | 'sawtooth' | 'square';
    readonly envelope: {
      readonly attack: number;
      readonly decay: number;
      readonly sustain: number;
      readonly release: number;
    };
    readonly gain: number;
    readonly reverb: {
      readonly enabled: boolean;
      readonly roomSize: number;
      readonly wet: number;
    };
    readonly chorus: {
      readonly enabled: boolean;
      readonly frequency: number;
      readonly delayTime: number;
      readonly depth: number;
    };
    readonly style: 'simultaneous' | 'arpeggio' | 'roll';
    readonly arpeggioDelay: number; // ms between notes in arpeggio
    readonly rollDelay: number; // ms between notes in roll
  };
}

// Audio service state interface
export interface AudioState {
  isInitialized: boolean;
  isPlaying: boolean;
  soundEnabled: boolean;
  nowPlaying: NowPlayingEntry[];
  activeVoices: Set<string>;
  error: string | null;
}

// Audio service actions interface
export interface AudioActions {
  playNote: (note: string, source: string) => Promise<void>;
  playChord: (notes: string[], source: string) => Promise<void>;
  setSoundEnabled: (enabled: boolean) => void;
  stopAllSounds: () => void;
  clearError: () => void;
}

// Combined audio context interface
export interface AudioContextValue {
  state: AudioState;
  actions: AudioActions;
  config: AudioConfig;
}

// Voice tracking interface for internal use
export interface Voice {
  oscillator: any; // Tone.Oscillator
  envelope: any;   // Tone.Envelope
  gainNode: any;   // Tone.Gain
}

// Audio service class interface
export interface IAudioService {
  initialize(): Promise<boolean>;
  playNote(noteName: string, config: AudioConfig): Promise<void>;
  playChord(noteNames: string[], config: AudioConfig): Promise<void>;
  stopAllVoices(): void;
  cleanup(): void;
  isInitialized(): boolean;
}