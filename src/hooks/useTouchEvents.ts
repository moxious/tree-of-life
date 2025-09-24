import { useCallback, useRef } from 'react';

interface TouchEventHandlers {
  onTouchStart: (event: React.TouchEvent) => void;
  onTouchEnd: (event: React.TouchEvent) => void;
  onTouchMove: (event: React.TouchEvent) => void;
  onMouseEnter: (event: React.MouseEvent) => void;
  onMouseLeave: (event: React.MouseEvent) => void;
  onClick: (event: React.MouseEvent) => void;
}

interface UseTouchEventsOptions {
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
  preventDefault?: boolean;
  touchDelay?: number;
}

/**
 * Custom hook for unified mouse and touch event handling
 * Provides consistent behavior across desktop and mobile devices
 */
export const useTouchEvents = ({
  onHover,
  onLeave,
  onClick,
  preventDefault = true,
  touchDelay = 100
}: UseTouchEventsOptions): TouchEventHandlers => {
  const touchStartTime = useRef<number>(0);
  const touchMoved = useRef<boolean>(false);
  const touchStartPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const leaveTimeout = useRef<number | null>(null);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (preventDefault) {
      event.preventDefault();
    }
    
    touchStartTime.current = Date.now();
    touchMoved.current = false;
    
    // Store initial touch position for movement detection
    if (event.touches.length > 0) {
      touchStartPosition.current = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      };
    }
    
    // Clear any pending leave timeout
    if (leaveTimeout.current) {
      clearTimeout(leaveTimeout.current);
      leaveTimeout.current = null;
    }
    
    onHover();
  }, [onHover, preventDefault]);

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    if (preventDefault) {
      event.preventDefault();
    }
    
    const touchDuration = Date.now() - touchStartTime.current;
    
    // Only trigger click if touch was brief, didn't move much, and was a single touch
    if (touchDuration < 500 && !touchMoved.current && event.touches.length === 0) {
      onClick();
    }
    
    // Delay leave to allow for click processing and prevent flickering
    leaveTimeout.current = setTimeout(() => {
      onLeave();
    }, touchDelay);
  }, [onClick, onLeave, preventDefault, touchDelay]);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (preventDefault) {
      event.preventDefault();
    }
    
    // Check if touch moved significantly
    if (event.touches.length > 0) {
      const currentTouch = event.touches[0];
      const deltaX = Math.abs(currentTouch.clientX - touchStartPosition.current.x);
      const deltaY = Math.abs(currentTouch.clientY - touchStartPosition.current.y);
      
      // Consider it moved if it moved more than 10 pixels
      if (deltaX > 10 || deltaY > 10) {
        touchMoved.current = true;
      }
    }
  }, [preventDefault]);

  const handleMouseEnter = useCallback((_event: React.MouseEvent) => {
    // Clear any pending leave timeout
    if (leaveTimeout.current) {
      clearTimeout(leaveTimeout.current);
      leaveTimeout.current = null;
    }
    onHover();
  }, [onHover]);

  const handleMouseLeave = useCallback((_event: React.MouseEvent) => {
    onLeave();
  }, [onLeave]);

  const handleClick = useCallback((_event: React.MouseEvent) => {
    onClick();
  }, [onClick]);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchMove,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onClick: handleClick
  };
};
