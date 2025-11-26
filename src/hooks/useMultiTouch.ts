import { useCallback, useRef } from 'react';
import type { AudioActions } from '../types/audio';
import type { SephirahData } from '../types/treeOfLife';

interface MultiTouchOptions {
  audioActions?: AudioActions;
  onMultiTouchChord?: (notes: string[], source: string) => void;
  maxTouchDelay?: number; // Maximum time between touches to consider them simultaneous
}

/**
 * Custom hook for handling multi-touch interactions
 * Enables multiple sephirah to be touched simultaneously for chord playing
 */
export const useMultiTouch = ({
  audioActions,
  onMultiTouchChord,
  maxTouchDelay = 500
}: MultiTouchOptions) => {
  const activeTouches = useRef<Map<number, { sephirah: SephirahData; timestamp: number }>>(new Map());
  const multiTouchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = useCallback((event: React.TouchEvent, sephirah: SephirahData) => {
    // Prevent default to avoid scrolling and other touch behaviors
    event.preventDefault();
    
    // Add this touch to active touches
    const touch = event.touches[0];
    if (touch) {
      activeTouches.current.set(touch.identifier, {
        sephirah,
        timestamp: Date.now()
      });
    }

    // Clear any existing timeout
    if (multiTouchTimeout.current) {
      clearTimeout(multiTouchTimeout.current);
    }

    // Set a timeout to process multi-touch after a brief delay
    multiTouchTimeout.current = setTimeout(() => {
      processMultiTouch();
    }, maxTouchDelay);
  }, [maxTouchDelay]);

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    // Remove ended touches
    Array.from(event.changedTouches).forEach(touch => {
      activeTouches.current.delete(touch.identifier);
    });

    // If no more active touches, process the multi-touch
    if (activeTouches.current.size === 0) {
      if (multiTouchTimeout.current) {
        clearTimeout(multiTouchTimeout.current);
        multiTouchTimeout.current = null;
      }
      processMultiTouch();
    }
  }, []);

  const processMultiTouch = useCallback(() => {
    const touches = Array.from(activeTouches.current.values());
    
    if (touches.length > 1) {
      // Multiple sephirah are being touched - create a multi-touch chord
      const sephirahNames = touches.map(t => t.sephirah.name);
      const chordName = `Multi-touch (${sephirahNames.join(', ')})`;
      
      console.log('🎵 MultiTouch: Processing multi-touch chord:', sephirahNames);
      
      // For now, we'll use a simple approach - you might want to implement
      // more sophisticated chord generation based on the touched sephirah
      if (onMultiTouchChord) {
        onMultiTouchChord(sephirahNames, chordName);
      } else if (audioActions?.playChord) {
        // Fallback to playing individual notes as a chord
        audioActions.playChord(sephirahNames, chordName);
      }
    }
    
    // Clear active touches after processing
    activeTouches.current.clear();
  }, [audioActions, onMultiTouchChord]);

  const clearMultiTouch = useCallback(() => {
    activeTouches.current.clear();
    if (multiTouchTimeout.current) {
      clearTimeout(multiTouchTimeout.current);
      multiTouchTimeout.current = null;
    }
  }, []);

  return {
    handleTouchStart,
    handleTouchEnd,
    clearMultiTouch,
    activeTouchCount: activeTouches.current.size
  };
};
