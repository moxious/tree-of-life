// Musical note to frequency mapping utilities
// Functional approach with pure functions for note calculations

// Standard A4 frequency (440 Hz)
const A4_FREQUENCY = 440;

// Note names in order (C, C♯, D, D♯, E, F, F♯, G, G♯, A, A♯, B)
const NOTE_NAMES = [
  'C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'
] as const;

type NoteName = typeof NOTE_NAMES[number];

// Pure function to get note index from note name
const getNoteIndex = (noteName: NoteName): number => {
  const index = NOTE_NAMES.indexOf(noteName);
  if (index === -1) {
    throw new Error(`Invalid note name: ${noteName}`);
  }
  return index;
};

// Pure function to calculate frequency from note name and octave
export const calculateFrequency = (noteName: string, octave: number): number => {
  // Validate note name exists in our mapping
  if (!NOTE_NAMES.includes(noteName as NoteName)) {
    throw new Error(`Unsupported note name: ${noteName}`);
  }
  
  const noteIndex = getNoteIndex(noteName as NoteName);
  const a4Index = getNoteIndex('A');
  const a4Octave = 4;
  
  // Calculate semitones from A4
  const semitonesFromA4 = (octave - a4Octave) * 12 + (noteIndex - a4Index);
  
  // Calculate frequency using the formula: f = f0 * 2^(n/12)
  return A4_FREQUENCY * Math.pow(2, semitonesFromA4 / 12);
};

// Pure function to generate frequencies for multiple octaves
export const generateOctaveFrequencies = (
  noteName: string, 
  octaves: number[], 
  baseOctave: number
): number[] => {
  return octaves.map(octave => calculateFrequency(noteName, octave));
};

// Pure function to validate note name format
export const isValidNoteName = (noteName: string): boolean => {
  return NOTE_NAMES.includes(noteName as NoteName);
};

// Pure function to get all supported note names
export const getSupportedNoteNames = (): readonly string[] => {
  return NOTE_NAMES;
};

// Pure function to create frequency mapping for all notes in an octave
export const createOctaveFrequencyMap = (octave: number): Record<string, number> => {
  return NOTE_NAMES.reduce((map, noteName) => {
    map[noteName] = calculateFrequency(noteName, octave);
    return map;
  }, {} as Record<string, number>);
};

// Pure function to get note name without octave (for display purposes)
export const extractNoteName = (fullNote: string): string => {
  // Remove any octave numbers from the end
  return fullNote.replace(/\d+$/, '');
};

// Pure function to validate and normalize note name
export const normalizeNoteName = (noteName: string): string => {
  const normalized = noteName.trim();
  if (!isValidNoteName(normalized)) {
    throw new Error(`Invalid note name: ${noteName}. Supported notes: ${NOTE_NAMES.join(', ')}`);
  }
  return normalized;
};
