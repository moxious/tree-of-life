import { useState, useCallback } from 'react';
import type { SephirahData, PathData, HoverState } from '../types/treeOfLife';

// Custom hook for managing hover state
export const useHoverState = () => {
  const [hoverState, setHoverState] = useState<HoverState>({
    sephirah: null,
    path: null,
    activeHoveredSephirah: null
  });

  const handleSephirahHover = useCallback((sephirah: SephirahData, isPinned: boolean) => {
    // Don't show hover info if something is pinned
    if (isPinned) {
      return;
    }
    
    // Only allow hover if no other sephirah is currently hovered
    // or if this is the same sephirah (for card mode transitions)
    if (!hoverState.activeHoveredSephirah || hoverState.activeHoveredSephirah === sephirah.name) {
      setHoverState({
        sephirah,
        path: null,
        activeHoveredSephirah: sephirah.name
      });
    }
  }, [hoverState.activeHoveredSephirah]);

  const handleSephirahLeave = useCallback(() => {
    setHoverState({
      sephirah: null,
      path: hoverState.path,
      activeHoveredSephirah: null
    });
  }, [hoverState.path]);

  const handlePathHover = useCallback((pathData: PathData, isPinned: boolean) => {
    // Don't show hover info if something is pinned
    if (isPinned) {
      return;
    }
    
    setHoverState({
      sephirah: null,
      path: pathData,
      activeHoveredSephirah: null
    });
  }, []);

  const handlePathLeave = useCallback(() => {
    setHoverState({
      sephirah: hoverState.sephirah,
      path: null,
      activeHoveredSephirah: hoverState.activeHoveredSephirah
    });
  }, [hoverState.sephirah, hoverState.activeHoveredSephirah]);

  const clearHover = useCallback(() => {
    setHoverState({
      sephirah: null,
      path: null,
      activeHoveredSephirah: null
    });
  }, []);

  return {
    hoverState,
    handleSephirahHover,
    handleSephirahLeave,
    handlePathHover,
    handlePathLeave,
    clearHover
  };
};
