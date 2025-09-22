import { useState, useCallback, useMemo } from 'react';
import treeConfig from '../treeOfLifeConfig.json';
import musicalSystems from '../musicalSystems.json';
import { patchMusicalNotes, validateMusicalSystem, findPathsBelow, findPathsAbove } from '../utils/treeOfLifeUtils';
import type { SephirahData, PathData } from '../types/treeOfLife';
import type { AudioActions } from '../types/audio';

// Unified state interface
interface TreeState {
  hover: {
    sephirah: SephirahData | null;
    path: PathData | null;
    activeHoveredSephirah: string | null;
  };
  pinned: {
    sephirah: SephirahData | null;
    path: PathData | null;
    isSephirahPinned: boolean;
    isPathPinned: boolean;
  };
  highlighting: {
    paths: Set<number>;
    chordNotes: {
      above: string[];
      below: string[];
    };
  };
  musical: {
    selectedSystem: string;
    patchedPaths: PathData[];
  };
}

// Unified action interface
interface TreeActions {
  // Hover actions
  handleSephirahHover: (sephirah: SephirahData) => void;
  handleSephirahLeave: () => void;
  handlePathHover: (path: PathData) => void;
  handlePathLeave: () => void;
  
  // Pin actions
  toggleSephirahPin: (sephirah: SephirahData) => void;
  togglePathPin: (path: PathData) => void;
  unpinSephirah: () => void;
  unpinPath: () => void;
  
  // Click actions
  handleSephirahClick: (sephirah: SephirahData) => void;
  handlePathClick: (path: PathData) => void;
  
  // Musical system actions
  changeMusicalSystem: (systemKey: string) => void;
  
  // Utility actions
  clearAll: () => void;
  clearHighlighting: () => void;
}

// Custom hook for unified tree state management
export const useTreeState = (audioActions?: AudioActions) => {
  // Single state object managing all tree interactions
  const [state, setState] = useState<TreeState>({
    hover: { 
      sephirah: null, 
      path: null, 
      activeHoveredSephirah: null 
    },
    pinned: { 
      sephirah: null, 
      path: null, 
      isSephirahPinned: false, 
      isPathPinned: false 
    },
    highlighting: { 
      paths: new Set(), 
      chordNotes: { above: [], below: [] } 
    },
    musical: { 
      selectedSystem: 'Paul_Foster_Case', 
      patchedPaths: [] 
    }
  });

  // Memoized patched configuration with musical notes
  const patchedConfig = useMemo(() => {
    const currentSystem = (musicalSystems as Record<string, any>)[state.musical.selectedSystem];
    
    if (!currentSystem) {
      console.warn(`Musical system '${state.musical.selectedSystem}' not found, using original config`);
      return treeConfig;
    }

    // Validate the musical system
    const requiredPathNumbers = Array.from({ length: 22 }, (_, i) => i + 11); // 11-32
    const validation = validateMusicalSystem(currentSystem, requiredPathNumbers);
    
    if (!validation.isValid) {
      console.warn(
        `Musical system '${state.musical.selectedSystem}' is missing assignments for paths: ${validation.missingPaths.join(', ')}`
      );
    }

    return patchMusicalNotes(treeConfig, currentSystem);
  }, [state.musical.selectedSystem]);

  // Update patched paths when musical system changes
  const patchedPaths = patchedConfig.paths;

  // Unified action handlers with proper state coordination
  const actions: TreeActions = {
    // Hover actions
    handleSephirahHover: useCallback((sephirah: SephirahData) => {
      // Don't show hover info if something is pinned
      if (state.pinned.isSephirahPinned || state.pinned.isPathPinned) {
        return;
      }
      
      // Only allow hover if no other sephirah is currently hovered
      // or if this is the same sephirah (for card mode transitions)
      if (!state.hover.activeHoveredSephirah || state.hover.activeHoveredSephirah === sephirah.name) {
        setState(prev => ({
          ...prev,
          hover: {
            sephirah,
            path: null,
            activeHoveredSephirah: sephirah.name
          }
        }));
      }
    }, [state.pinned.isSephirahPinned, state.pinned.isPathPinned, state.hover.activeHoveredSephirah]),

    handleSephirahLeave: useCallback(() => {
      setState(prev => ({
        ...prev,
        hover: {
          sephirah: null,
          path: prev.hover.path,
          activeHoveredSephirah: null
        }
      }));
    }, []),

    handlePathHover: useCallback((path: PathData) => {
      // Don't show hover info if something is pinned
      if (state.pinned.isSephirahPinned || state.pinned.isPathPinned) {
        return;
      }
      
      setState(prev => ({
        ...prev,
        hover: {
          sephirah: null,
          path,
          activeHoveredSephirah: null
        }
      }));
    }, [state.pinned.isSephirahPinned, state.pinned.isPathPinned]),

    handlePathLeave: useCallback(() => {
      setState(prev => ({
        ...prev,
        hover: {
          sephirah: prev.hover.sephirah,
          path: null,
          activeHoveredSephirah: prev.hover.activeHoveredSephirah
        }
      }));
    }, []),

    // Pin actions
    toggleSephirahPin: useCallback((sephirah: SephirahData) => {
      setState(prev => {
        const isCurrentlyPinned = prev.pinned.sephirah?.name === sephirah.name;
        
        return {
          ...prev,
          pinned: isCurrentlyPinned 
            ? { sephirah: null, path: null, isSephirahPinned: false, isPathPinned: false }
            : { sephirah, path: null, isSephirahPinned: true, isPathPinned: false },
          hover: { sephirah: null, path: null, activeHoveredSephirah: null }
        };
      });
    }, []),

    togglePathPin: useCallback((path: PathData) => {
      setState(prev => {
        const isCurrentlyPinned = prev.pinned.path?.pathNumber === path.pathNumber;
        
        return {
          ...prev,
          pinned: isCurrentlyPinned
            ? { sephirah: null, path: null, isSephirahPinned: false, isPathPinned: false }
            : { sephirah: null, path, isSephirahPinned: false, isPathPinned: true },
          hover: { sephirah: null, path: null, activeHoveredSephirah: null }
        };
      });
    }, []),

    unpinSephirah: useCallback(() => {
      setState(prev => ({
        ...prev,
        pinned: {
          ...prev.pinned,
          sephirah: null,
          isSephirahPinned: false
        }
      }));
    }, []),

    unpinPath: useCallback(() => {
      setState(prev => ({
        ...prev,
        pinned: {
          ...prev.pinned,
          path: null,
          isPathPinned: false
        }
      }));
    }, []),

    // Click actions
    handleSephirahClick: useCallback((sephirah: SephirahData) => {
      // Find paths above and below the sephirah
      const pathsAbove = findPathsAbove(sephirah.name, patchedPaths);
      const pathsBelow = findPathsBelow(sephirah.name, patchedPaths);
      
      console.log(`🎵 TreeState: Sephirah ${sephirah.name} clicked!`);
      console.log(`🎵 TreeState: Paths above:`, pathsAbove.map(p => ({
        pathNumber: p.pathNumber,
        hebrewLetter: p.hebrewLetter,
        musicalNote: p.musicalNote
      })));
      console.log(`🎵 TreeState: Paths below:`, pathsBelow.map(p => ({
        pathNumber: p.pathNumber,
        hebrewLetter: p.hebrewLetter,
        musicalNote: p.musicalNote
      })));
      
      // Highlight only below paths briefly
      const belowPathNumbers = new Set(pathsBelow.map(path => path.pathNumber));
      
      // Update chord notes for info panel (both above and below)
      const aboveChordNotes = pathsAbove.map(path => path.musicalNote);
      const belowChordNotes = pathsBelow.map(path => path.musicalNote);
      
      setState(prev => ({
        ...prev,
        highlighting: {
          paths: belowPathNumbers,
          chordNotes: { above: aboveChordNotes, below: belowChordNotes }
        },
        pinned: { sephirah, path: null, isSephirahPinned: true, isPathPinned: false },
        hover: { sephirah: null, path: null, activeHoveredSephirah: null }
      }));
      
      // Clear highlighting after 2 seconds
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          highlighting: {
            ...prev.highlighting,
            paths: new Set()
          }
        }));
      }, 2000);
      
      // Play only below chord if there are below paths
      if (pathsBelow.length > 0) {
        console.log(`🎵 TreeState: Playing below chord with notes:`, belowChordNotes);
        console.log(`🎵 TreeState: audioActions available:`, !!audioActions);
        console.log(`🎵 TreeState: playChord available:`, !!audioActions?.playChord);
        
        if (audioActions?.playChord) {
          console.log(`🎵 TreeState: Calling playChord...`);
          audioActions.playChord(belowChordNotes, `${sephirah.name} (Below)`);
        } else {
          console.warn('🎵 TreeState: Audio actions not available for chord playback');
        }
      } else {
        console.log(`🎵 TreeState: No below paths for ${sephirah.name}, skipping chord playback`);
      }
    }, [patchedPaths]),

    handlePathClick: useCallback((path: PathData) => {
      // Play audio for the musical note
      if (audioActions?.playNote) {
        audioActions.playNote(path.musicalNote, `Path ${path.pathNumber}`);
      }
      
      setState(prev => ({
        ...prev,
        pinned: { sephirah: null, path, isSephirahPinned: false, isPathPinned: true },
        hover: { sephirah: null, path: null, activeHoveredSephirah: null }
      }));
    }, []),

    // Musical system actions
    changeMusicalSystem: useCallback((systemKey: string) => {
      setState(prev => ({
        ...prev,
        musical: {
          ...prev.musical,
          selectedSystem: systemKey
        }
      }));
    }, []),

    // Utility actions
    clearAll: useCallback(() => {
      setState(prev => ({
        ...prev,
        hover: { sephirah: null, path: null, activeHoveredSephirah: null },
        pinned: { sephirah: null, path: null, isSephirahPinned: false, isPathPinned: false },
        highlighting: { paths: new Set(), chordNotes: { above: [], below: [] } }
      }));
    }, []),

    clearHighlighting: useCallback(() => {
      setState(prev => ({
        ...prev,
        highlighting: {
          ...prev.highlighting,
          paths: new Set()
        }
      }));
    }, [])
  };

  // Update patched paths in state when they change
  const updatedState = useMemo(() => ({
    ...state,
    musical: {
      ...state.musical,
      patchedPaths
    }
  }), [state, patchedPaths]);

  return { 
    state: updatedState, 
    actions,
    // Convenience getters for backward compatibility
    hoverState: updatedState.hover,
    pinnedState: updatedState.pinned,
    highlightedPaths: updatedState.highlighting.paths,
    chordNotes: updatedState.highlighting.chordNotes,
    selectedMusicalSystem: updatedState.musical.selectedSystem,
    patchedPaths: updatedState.musical.patchedPaths
  };
};
