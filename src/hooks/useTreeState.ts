import { useState, useCallback, useMemo } from 'react';
import treeConfig from '../treeOfLifeConfig.json';
import musicalSystems from '../musicalSystems.json';
import { patchMusicalNotes, validateMusicalSystem, findPathsBelow, findPathsAbove, findTreeTriadPaths } from '../utils/treeOfLifeUtils';
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
  ui: {
    selectedWorld: string;
    viewMode: string;
    chordType: string;
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
  
  // UI actions
  changeSelectedWorld: (world: string) => void;
  changeViewMode: (mode: string) => void;
  changeChordType: (type: string) => void;
  
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
      selectedSystem: 'Four_Worlds_Briah_Complete', 
      patchedPaths: [] 
    },
    ui: {
      selectedWorld: 'briah',
      viewMode: 'sphere',
      chordType: 'below'
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
      const treeTriadPaths = findTreeTriadPaths(sephirah.name, patchedPaths);
      
      // Get selected chord type and corresponding paths/notes
      let selectedPaths: PathData[];
      let selectedChordNotes: string[];
      let pathNumbers: Set<number>;
      
      switch (state.ui.chordType) {
        case 'above':
          selectedPaths = pathsAbove;
          selectedChordNotes = pathsAbove.map(path => path.musicalNote);
          pathNumbers = new Set(pathsAbove.map(path => path.pathNumber));
          break;
        case 'triad':
          selectedPaths = treeTriadPaths;
          selectedChordNotes = treeTriadPaths.map(path => path.musicalNote);
          pathNumbers = new Set(treeTriadPaths.map(path => path.pathNumber));
          break;
        case 'below':
        default:
          selectedPaths = pathsBelow;
          selectedChordNotes = pathsBelow.map(path => path.musicalNote);
          pathNumbers = new Set(pathsBelow.map(path => path.pathNumber));
          break;
      }
      
      // Update chord notes for info panel (all types for reference)
      const aboveChordNotes = pathsAbove.map(path => path.musicalNote);
      const belowChordNotes = pathsBelow.map(path => path.musicalNote);
      const treeTriadChordNotes = treeTriadPaths.map(path => path.musicalNote);
      
      setState(prev => ({
        ...prev,
        highlighting: {
          paths: pathNumbers,
          chordNotes: { above: aboveChordNotes, below: belowChordNotes, treeTriad: treeTriadChordNotes }
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
      
      // Play selected chord type if there are paths
      if (selectedPaths.length > 0) {        
        if (audioActions?.playChord) {
          console.log(`🎵 TreeState: Calling playChord...`);
          const sName = sephirah.name.charAt(0).toUpperCase() + sephirah.name.slice(1);
          const cType = state.ui.chordType.charAt(0).toUpperCase() + state.ui.chordType.slice(1);
          const chordName = `${sName} (${cType})`
          audioActions.playChord(selectedChordNotes, chordName);
        } else {
          console.warn('🎵 TreeState: Audio actions not available for chord playback');
        }
      } else {
        console.log(`🎵 TreeState: No ${state.ui.chordType} paths for ${sephirah.name}, skipping chord playback`);
      }
    }, [patchedPaths, audioActions, state.ui.chordType]),

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
    }, [audioActions]),

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

    // UI actions
    changeSelectedWorld: useCallback((world: string) => {
      setState(prev => ({
        ...prev,
        ui: {
          ...prev.ui,
          selectedWorld: world
        }
      }));
    }, []),

    changeViewMode: useCallback((mode: string) => {
      setState(prev => ({
        ...prev,
        ui: {
          ...prev.ui,
          viewMode: mode
        }
      }));
    }, []),

    changeChordType: useCallback((type: string) => {
      setState(prev => ({
        ...prev,
        ui: {
          ...prev.ui,
          chordType: type
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
    patchedPaths: updatedState.musical.patchedPaths,
    selectedWorld: updatedState.ui.selectedWorld,
    viewMode: updatedState.ui.viewMode,
    chordType: updatedState.ui.chordType
  };
};
