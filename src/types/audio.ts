// Audio types for Tree of Life sound feature

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
