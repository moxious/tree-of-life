// Audio types for Tree of Life sound feature

export interface NowPlayingEntry {
  id: string;
  source: string;        // "Keter (Below)" or "Path 22"
  notes: string[];       // ["C", "E", "G"]
  startTime: number;
  duration: number;
}

export interface AudioServiceRef {
  playNote: (note: string, source: string) => void;
  playChord: (notes: string[], source: string) => void;
  setSoundEnabled: (enabled: boolean) => void;
  isSoundEnabled: () => boolean;
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
