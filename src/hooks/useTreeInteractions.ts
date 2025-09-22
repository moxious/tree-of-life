import { useState, useCallback } from 'react';
import { findPathsBelow, findPathsAbove } from '../utils/treeOfLifeUtils';
import type { SephirahData, PathData } from '../types/treeOfLife';

// Custom hook for managing tree interaction logic (clicks, highlighting, audio)
export const useTreeInteractions = (patchedPaths: PathData[]) => {
  // Highlighted paths state for chord visual feedback
  const [highlightedPaths, setHighlightedPaths] = useState<Set<number>>(new Set());
  
  // Chord notes state for info panel
  const [chordNotes, setChordNotes] = useState<{
    above: string[];
    below: string[];
  }>({ above: [], below: [] });

  const handlePathClick = useCallback((pathData: PathData, onPinPath: (pathData: PathData) => void) => {
    console.log('🎵 TreeInteractions: Path clicked!', {
      pathNumber: pathData.pathNumber,
      hebrewLetter: pathData.hebrewLetter,
      musicalNote: pathData.musicalNote
    });
    
    // Play audio for the musical note
    if (typeof (window as any).playTreeOfLifeNote === 'function') {
      console.log('🎵 TreeInteractions: Calling playTreeOfLifeNote with note:', pathData.musicalNote);
      (window as any).playTreeOfLifeNote(pathData.musicalNote, `Path ${pathData.pathNumber}`);
    } else {
      console.error('🎵 TreeInteractions: playTreeOfLifeNote function not found on window object');
    }
    
    onPinPath(pathData);
  }, []);

  const handleSephirahClick = useCallback((
    sephirah: SephirahData, 
    onPinSephirah: (sephirah: SephirahData) => void
  ) => {
    // Find paths above and below the sephirah
    const pathsAbove = findPathsAbove(sephirah.name, patchedPaths);
    const pathsBelow = findPathsBelow(sephirah.name, patchedPaths);
    
    console.log(`🎵 TreeInteractions: Sephirah ${sephirah.name} clicked!`);
    console.log(`🎵 TreeInteractions: Paths above:`, pathsAbove.map(p => ({
      pathNumber: p.pathNumber,
      hebrewLetter: p.hebrewLetter,
      musicalNote: p.musicalNote
    })));
    console.log(`🎵 TreeInteractions: Paths below:`, pathsBelow.map(p => ({
      pathNumber: p.pathNumber,
      hebrewLetter: p.hebrewLetter,
      musicalNote: p.musicalNote
    })));
    
    // Highlight only below paths briefly
    const belowPathNumbers = new Set(pathsBelow.map(path => path.pathNumber));
    setHighlightedPaths(belowPathNumbers);
    
    // Clear highlighting after 2 seconds
    setTimeout(() => {
      setHighlightedPaths(new Set());
    }, 2000);
    
    // Update chord notes for info panel (both above and below)
    const aboveChordNotes = pathsAbove.map(path => path.musicalNote);
    const belowChordNotes = pathsBelow.map(path => path.musicalNote);
    setChordNotes({ above: aboveChordNotes, below: belowChordNotes });
    
    // Play only below chord if there are below paths
    if (pathsBelow.length > 0) {
      console.log(`🎵 TreeInteractions: Playing below chord with notes:`, belowChordNotes);
      
      if (typeof (window as any).playTreeOfLifeChord === 'function') {
        (window as any).playTreeOfLifeChord(belowChordNotes, `${sephirah.name} (Below)`);
      } else {
        console.error('🎵 TreeInteractions: playTreeOfLifeChord function not found on window object');
      }
    } else {
      console.log(`🎵 TreeInteractions: No below paths for ${sephirah.name}, skipping chord playback`);
    }
    
    onPinSephirah(sephirah);
  }, [patchedPaths]);

  const clearHighlighting = useCallback(() => {
    setHighlightedPaths(new Set());
  }, []);

  const clearChordNotes = useCallback(() => {
    setChordNotes({ above: [], below: [] });
  }, []);

  return {
    highlightedPaths,
    chordNotes,
    handlePathClick,
    handleSephirahClick,
    clearHighlighting,
    clearChordNotes
  };
};
