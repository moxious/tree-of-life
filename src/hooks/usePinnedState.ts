import { useState, useCallback } from 'react';
import type { SephirahData, PathData, PinnedState } from '../types/treeOfLife';

// Custom hook for managing pinned state
export const usePinnedState = () => {
  const [pinnedState, setPinnedState] = useState<PinnedState>({
    sephirah: null,
    path: null,
    isSephirahPinned: false,
    isPathPinned: false
  });

  const pinSephirah = useCallback((sephirah: SephirahData) => {
    setPinnedState({
      sephirah,
      path: null,
      isSephirahPinned: true,
      isPathPinned: false
    });
  }, []);

  const pinPath = useCallback((pathData: PathData) => {
    setPinnedState({
      sephirah: null,
      path: pathData,
      isSephirahPinned: false,
      isPathPinned: true
    });
  }, []);

  const unpinSephirah = useCallback(() => {
    setPinnedState(prev => ({
      ...prev,
      sephirah: null,
      isSephirahPinned: false
    }));
  }, []);

  const unpinPath = useCallback(() => {
    setPinnedState(prev => ({
      ...prev,
      path: null,
      isPathPinned: false
    }));
  }, []);

  const toggleSephirahPin = useCallback((sephirah: SephirahData) => {
    if (pinnedState.sephirah && pinnedState.sephirah.name === sephirah.name) {
      unpinSephirah();
    } else {
      pinSephirah(sephirah);
    }
  }, [pinnedState.sephirah, pinSephirah, unpinSephirah]);

  const togglePathPin = useCallback((pathData: PathData) => {
    if (pinnedState.path && pinnedState.path.pathNumber === pathData.pathNumber) {
      unpinPath();
    } else {
      pinPath(pathData);
    }
  }, [pinnedState.path, pinPath, unpinPath]);

  const clearAllPins = useCallback(() => {
    setPinnedState({
      sephirah: null,
      path: null,
      isSephirahPinned: false,
      isPathPinned: false
    });
  }, []);

  return {
    pinnedState,
    pinSephirah,
    pinPath,
    unpinSephirah,
    unpinPath,
    toggleSephirahPin,
    togglePathPin,
    clearAllPins
  };
};
