// Chord detection utilities using TonalJS
// Functional approach with pure functions for chord analysis

import { Chord } from '@tonaljs/tonal';

/**
 * Pure function to detect chord name from an array of notes
 * @param notes Array of note names (e.g., ["C", "E", "G"])
 * @returns Detected chord name or null if no chord detected
 */
export const detectChordName = (notes: string[]): string | null => {
  if (!notes || notes.length === 0) {
    return null;
  }

  // Handle single note case
  if (notes.length === 1) {
    return notes[0];
  }

  try {
    // Use TonalJS to detect possible chord names
    const normalizedNotes = notes.map(n => n.replace('♯', '#').replace('♭', 'b'));
    const detectedChords = Chord.detect(normalizedNotes);
    console.log('detectedChords', normalizedNotes, " ", detectedChords);
    // Return the first (most likely) chord name, or null if none found
    return detectedChords.length > 0 ? detectedChords[0] : null;
  } catch (error) {
    console.warn('Chord detection failed for notes:', notes, error);
    return null;
  }
};

/**
 * Pure function to format notes for display
 * @param notes Array of note names
 * @returns Formatted string (e.g., "C, E, G")
 */
export const formatNotesForDisplay = (notes: string[]): string => {
  return notes.join(', ');
};

/**
 * Pure function to create display text for now playing entry
 * @param source Source name (e.g., "Keter (Below)")
 * @param notes Array of note names
 * @param detectedChord Detected chord name (optional)
 * @returns Formatted display string
 */
export const createNowPlayingDisplayText = (
  source: string,
  notes: string[],
  detectedChord?: string | null
): string => {
  const notesText = formatNotesForDisplay(notes);
  
  if (detectedChord) {
    return `${source} ${detectedChord} (${notesText})`;
  }
  
  return `${source}: ${notesText}`;
};

/**
 * Pure function to validate note names before chord detection
 * @param notes Array of note names
 * @returns True if all notes are valid, false otherwise
 */
export const validateNotes = (notes: string[]): boolean => {
  if (!Array.isArray(notes) || notes.length === 0) {
    return false;
  }
  
  // Basic validation - check if notes are non-empty strings
  return notes.every(note => typeof note === 'string' && note.trim().length > 0);
};

/**
 * Pure function to normalize note names for chord detection
 * @param notes Array of note names
 * @returns Array of normalized note names
 */
export const normalizeNotesForDetection = (notes: string[]): string[] => {
  return notes
    .map(note => note.trim().toUpperCase())
    .filter(note => note.length > 0);
};
