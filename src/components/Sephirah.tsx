import React, { useState, useRef, useEffect } from 'react';
import type { SephirahData } from '../types/treeOfLife';

interface SephirahProps {
  name: string;
  position: { x: number; y: number };
  color: string;
  image: string | null;
  radius: number;
  viewMode: string;
  metadata: {
    hebrewName: string;
    englishName: string;
    planetaryCorrespondence: string;
    planetarySymbol: string;
    element: string;
  };
  worldColors: {
    assiah: { color: string };
    yetzirah: { color: string };
    briah: { color: string };
    atziluth: { color: string };
  };
  onHover: (sephirah: SephirahData) => void;
  onLeave: () => void;
  onSephirahClick: (sephirah: SephirahData) => void;
  isPinned: boolean;
}

const Sephirah: React.FC<SephirahProps> = ({ 
  name, 
  position, 
  color, 
  image, 
  radius, 
  viewMode,
  metadata, 
  worldColors,
  onHover, 
  onLeave,
  onSephirahClick,
  isPinned
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<number | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // Only implement new hover logic for card mode
  if (viewMode !== 'card') {
    return (
      <g 
        className={`sephirah-group ${viewMode === 'card' ? 'card-mode' : 'sphere-mode'}`}
        data-name={name}
        onMouseEnter={() => onHover({ name, metadata, worldColors })}
        onMouseLeave={onLeave}
        onClick={() => onSephirahClick({ name, metadata, worldColors })}
      >
        <circle
          cx={position.x}
          cy={position.y}
          r={radius}
          fill={image ? `url(#${name}-pattern)` : color}
          className={`sephirah ${isPinned ? 'pinned' : ''}`}
          data-name={name}
        />
        {image && (
          <defs>
            <pattern id={`${name}-pattern`} patternUnits="objectBoundingBox" width="1" height="1">
              <image
                href={image}
                x="0"
                y="0"
                width={radius * 2}
                height={radius * 2}
                preserveAspectRatio="xMidYMid slice"
              />
            </pattern>
          </defs>
        )}
        <text
          x={position.x}
          y={position.y - radius - 10}
          textAnchor="middle"
          className="sephirah-label"
          fill="#ffffff"
          fontSize="14"
          fontWeight="bold"
        >
          {name.charAt(0).toUpperCase() + name.slice(1)}
        </text>
      </g>
    );
  }

  // Card mode hover detection logic
  const handleCircleEnter = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      // Small delay to prevent flickering
      transitionTimeoutRef.current = setTimeout(() => {
        setIsHovered(true);
        setIsTransitioning(false);
        onHover({ name, metadata, worldColors });
      }, 50);
    }
  };

  const handleRectangleEnter = () => {
    // Keep hover active
    setIsHovered(true);
  };

  const handleRectangleLeave = () => {
    setIsHovered(false);
    onLeave();
  };

  return (
    <g 
      className={`sephirah-group ${viewMode === 'card' ? 'card-mode' : 'sphere-mode'}`}
      data-name={name}
    >
      {/* Circle hover detector - only visible when not hovered */}
      {!isHovered && !isTransitioning && (
        <circle
          cx={position.x}
          cy={position.y}
          r={radius}
          fill="transparent"
          className="sephirah-hover-detector sephirah-hover-detector-circle"
          onMouseEnter={handleCircleEnter}
          onClick={() => onSephirahClick({ name, metadata, worldColors })}
        />
      )}

      {/* Rectangle hover detector - only visible when hovered */}
      {isHovered && (
        <rect
          x={position.x - radius * 2}
          y={position.y - radius * 2}
          width={radius * 4}
          height={radius * 4}
          fill="transparent"
          className="sephirah-hover-detector sephirah-hover-detector-rectangle"
          onMouseEnter={handleRectangleEnter}
          onMouseLeave={handleRectangleLeave}
          onClick={() => onSephirahClick({ name, metadata, worldColors })}
        />
      )}

      {/* Visual circle - always present but with pointer-events disabled */}
      <circle
        cx={position.x}
        cy={position.y}
        r={radius}
        fill={image ? `url(#${name}-pattern)` : color}
        className={`sephirah ${isPinned ? 'pinned' : ''}`}
        data-name={name}
      />

      {/* Full rectangular card for hover in card mode */}
      {image && viewMode === 'card' && (
        <rect
          x={position.x - radius}
          y={position.y - radius}
          width={radius * 2}
          height={radius * 2}
          fill={`url(#${name}-full-pattern)`}
          className="sephirah-full-card"
          data-name={name}
        />
      )}

      {/* Pattern definitions */}
      {image && (
        <defs>
          <pattern id={`${name}-pattern`} patternUnits="objectBoundingBox" width="1" height="1">
            <image
              href={image}
              x="0"
              y="0"
              width={radius * 2}
              height={radius * 2}
              preserveAspectRatio="xMidYMid slice"
            />
          </pattern>
          {viewMode === 'card' && (
            <pattern id={`${name}-full-pattern`} patternUnits="objectBoundingBox" width="1" height="1">
              <image
                href={image}
                x="0"
                y="0"
                width={radius * 2}
                height={radius * 2}
                preserveAspectRatio="xMidYMid meet"
              />
            </pattern>
          )}
        </defs>
      )}

      {/* Text label that appears on hover */}
      <text
        x={position.x}
        y={position.y - radius - 10}
        textAnchor="middle"
        className="sephirah-label"
        fill="#ffffff"
        fontSize="14"
        fontWeight="bold"
      >
        {name.charAt(0).toUpperCase() + name.slice(1)}
      </text>
    </g>
  );
};

export default Sephirah;
