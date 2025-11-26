export type Note = string; // e.g., "C", "F#", "Bb"

export type WorldName = 'Assiah' | 'Yetzirah' | 'Atziluth' | 'Briah';

export interface World {
  name: WorldName;
  palette: Note[]; // The 9 tones
  centerKey: Note; // The root of the central major triad
  relatedKeys: Note[]; // The roots of the 3 major keys
}

export interface Triad {
  root: Note;
  quality: 'Major' | 'Minor';
  tones: Note[];
}

export interface PathAssignment {
  pathNumber: number;
  note: Note;
}

export interface TreeState {
  assignments: Record<number, Note>;
}

export interface SephirahChordDef {
  name: string;
  pathNumbers: number[];
}

export interface GeneratedChord {
  chord: string; // e.g., "Keter (Below)"
  path_numbers: number[];
  chord_tones: Note[];
  chord_name: string;
  notes: string;
  spice: string;
}

export interface GeneratedSystem {
  world: string;
  description: string;
  references: string[];
  system: string;
  assignments: Record<string, string>; // pathNumber -> note
  chords: GeneratedChord[];
}

