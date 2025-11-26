import { Chord, Note, Interval } from '@tonaljs/tonal';
import { normalizeNoteName } from './musicalNotes';

export interface VoicedNote {
  note: string;
  relativeOctave: number;
  interval?: string;
}

/**
 * Pure function to calculate voicing for a set of notes
 * Distributes notes across octaves to avoid dissonance and improve clarity
 */
export const getChordVoicing = (notes: string[]): VoicedNote[] => {
  if (!notes || notes.length === 0) return [];
  
  // Normalize input notes
  const normalizedNotes = notes.map(n => normalizeNoteName(n));
  
  // Convert to Tonal format (F#) for detection
  // This ensures TonalJS can correctly process the notes
  const tonalNotes = normalizedNotes.map(n => n.replace(/♯/g, '#').replace(/♭/g, 'b'));
  
  // 1. Detect Chord
  const detected = Chord.detect(tonalNotes);
  let root = "";
  
  // Try to find a chord where the root is actually in our notes
  // This helps avoid inversions being misidentified as weird chords rooted elsewhere
  if (detected && detected.length > 0) {
    // Prefer the first detection that has its root in our note list
    const bestMatch = detected.find(chordName => {
      const c = Chord.get(chordName);
      // Check against tonalNotes since Chord.get returns ASCII format
      return tonalNotes.includes(c.tonic || "");
    });
    
    if (bestMatch) {
      root = Chord.get(bestMatch).tonic || "";
    } else {
      // Fallback to first detection
      root = Chord.get(detected[0]).tonic || "";
    }
  }

  // If we have a root, we can voice based on intervals
  if (root) {
    return normalizedNotes.map((note, index) => {
      // Calculate interval from root (using Tonal note format)
      const tonalNote = tonalNotes[index];
      const interval = Note.distance(root, tonalNote);
      const semitones = Interval.semitones(interval);
      
      // Default relative octave
      let relativeOctave = 0;
      
      // Logic for octave spreading:
      // Keep Root, 3rd, 4th, 5th, 7th in base octave (generally)
      // Move tensions/extensions (9, 11, 13) up
      // Move minor 2nds (b9) up to avoid clash with root
      
      // Simplify semitones to 0-11 range for interval class
      // Handle case where semitones might be undefined
      if (semitones === undefined) {
        return {
          note,
          relativeOctave,
          interval
        };
      }
      
      const intervalClass = semitones % 12;
      
      // Check for b2/b9 (semitone 1) - highly dissonant with root
      if (intervalClass === 1) {
        relativeOctave = 1;
      }
      
      // Check for 2/9 (semitone 2) - often better voiced up
      if (intervalClass === 2) {
         relativeOctave = 1;
      }
      
      // Check for 4/11 (semitone 5)
      // If we have a 3rd present, move 4th up to avoid clash?
      // For now, let's keep 4th in base unless it's explicitly an extension chord logic
      // But typically 11th is voiced higher.
      
      // Check for 6/13 (semitone 9)
      // 6th often okay in base, 13th high.
      
      // Special case: If note is lower in pitch class than root, it might be an inversion
      // But we are assigning relative octaves to the *same* base octave.
      // If we want the root to be the bass, we should ensure other notes aren't below it if they map to 0.
      // But we are generating frequencies based on (Base + Relative).
      
      // Let's just use the specific "Avoid b9 low" rule and "Extensions high" rule.
      
      // If the note IS the root, it stays at 0.
      if (intervalClass === 0) {
        relativeOctave = 0;
      }
      
      return {
        note,
        relativeOctave,
        interval
      };
    });
  }
  
  // Fallback: No chord detected (or we want to refine the sorting)
  // Sort by pitch class to find clusters
  // We need to assign an arbitrary order.
  
  // Map notes to midi numbers in a single octave (e.g. 4)
  const noteObjects = normalizedNotes.map((note, index) => ({
    note,
    // Get midi value for note in octave 4 using Tonal format
    midi: Note.midi(`${tonalNotes[index]}4`) || 0
  }));
  
  // Sort by pitch
  noteObjects.sort((a, b) => a.midi - b.midi);
  
  const voiced: VoicedNote[] = [];
  let previousMidi = -1;
  let currentOctaveOffset = 0;
  
  noteObjects.forEach(obj => {
    let relativeOctave = currentOctaveOffset;
    
    // If this note is very close to the previous one (e.g. 1 or 2 semitones)
    // Move it up an octave to "open" the voicing
    if (previousMidi !== -1 && (obj.midi - previousMidi) <= 2) {
      relativeOctave += 1;
    }
    
    // Update state
    // If we moved up, should we stay up? Or just move this one note?
    // "Drop 2" style or spread voicing usually implies alternating or spreading out.
    // Simple rule: if we bumped this one, effectively the "floor" for the next note is this octave.
    // But for simplicity, let's just bump this specific note if it clashes.
    
    voiced.push({
      note: obj.note,
      relativeOctave,
    });
    
    // Use the *effective* pitch of this note for the next comparison?
    // Or just the base pitch?
    // If we move C up, and next is D, D is close to C.
    // If C becomes C5, D4 is far.
    // But we are iterating sorted low-to-high.
    // F, Gb, ...
    // F (0)
    // Gb (diff 1) -> Gb (+1)
    
    previousMidi = obj.midi; 
    // Wait, if we handled relativeOctave, we ideally track the *voiced* midi.
    // But we only compare semitone distance in the base octave to detect clusters.
  });
  
  // Restore original order? Or return sorted?
  // The audio service just iterates and plays, order doesn't matter for simultaneous.
  // But for arpeggios, sorted (lowest to highest) usually makes sense.
  // Let's sort the final result by (relativeOctave * 12 + baseMidi)
  
  return voiced.sort((a, b) => {
    // Use tonal format for sorting calculation to ensure correct MIDI values
    const noteA = a.note.replace(/♯/g, '#').replace(/♭/g, 'b');
    const noteB = b.note.replace(/♯/g, '#').replace(/♭/g, 'b');
    const midiA = (Note.midi(`${noteA}4`) || 0) + (a.relativeOctave * 12);
    const midiB = (Note.midi(`${noteB}4`) || 0) + (b.relativeOctave * 12);
    return midiA - midiB;
  });
};

