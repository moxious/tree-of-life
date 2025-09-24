import React from 'react';
import type { PathData } from '../types/treeOfLife';
import { useTouchEvents } from '../hooks/useTouchEvents';

interface PathProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  stroke: string;
  strokeWidth: number;
  metadata: PathData;
  onHover: (pathData: PathData) => void;
  onLeave: () => void;
  onPathClick: (pathData: PathData) => void;
  isPinned: boolean;
  isHighlighted?: boolean;
}

const Path: React.FC<PathProps> = ({ from, to, stroke, strokeWidth, metadata, onHover, onLeave, onPathClick, isPinned, isHighlighted = false }) => {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  // Create touch event handlers
  const touchEvents = useTouchEvents({
    onHover: () => onHover(metadata),
    onLeave: onLeave,
    onClick: () => onPathClick(metadata),
    preventDefault: true,
    touchDelay: 100
  });

  // Calculate path direction vector
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  // Calculate perpendicular vector (rotate 90 degrees)
  const perpX = -dy;
  const perpY = dx;
  
  // Normalize and scale the perpendicular vector for offset
  const length = Math.sqrt(perpX * perpX + perpY * perpY);
  const offsetDistance = 12; // pixels to offset from center
  const offsetX = (perpX / length) * offsetDistance;
  const offsetY = (perpY / length) * offsetDistance;
  
  // Apply offset to label position
  const labelX = midX + offsetX;
  const labelY = midY + offsetY;

  // Check if this path is part of the Lightning Flash of Creation
  const isLightningFlash = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    // Define the Lightning Flash path connections based on positions
    const lightningFlashPaths = [
      // Keter to Hockmah
      { fromPos: { x: 400, y: 50 }, toPos: { x: 550, y: 150 } },
      // Hockmah to Binah  
      { fromPos: { x: 550, y: 150 }, toPos: { x: 250, y: 150 } },
      // Hesed to Gevurah (Lightning Flash crosses the abyss conceptually)
      { fromPos: { x: 550, y: 300 }, toPos: { x: 250, y: 300 } },
      // Gevurah to Tiferet
      { fromPos: { x: 250, y: 300 }, toPos: { x: 400, y: 375 } },
      // Tiferet to Netzach
      { fromPos: { x: 400, y: 375 }, toPos: { x: 550, y: 450 } },
      // Netzach to Hod
      { fromPos: { x: 550, y: 450 }, toPos: { x: 250, y: 450 } },
      // Hod to Yesod
      { fromPos: { x: 250, y: 450 }, toPos: { x: 400, y: 525 } },
      // Yesod to Malkuth
      { fromPos: { x: 400, y: 525 }, toPos: { x: 400, y: 620 } }
    ];
    
    return lightningFlashPaths.some(path => 
      (path.fromPos.x === from.x && path.fromPos.y === from.y && 
       path.toPos.x === to.x && path.toPos.y === to.y) ||
      (path.fromPos.x === to.x && path.fromPos.y === to.y && 
       path.toPos.x === from.x && path.toPos.y === from.y)
    );
  };

  const isFlashPath = isLightningFlash(from, to);
  const pathStrokeWidth = isFlashPath ? strokeWidth + 1 : strokeWidth;
  
  // Determine stroke color and width based on state
  const getStrokeColor = () => {
    if (isHighlighted) return "#ffd700"; // Gold for highlighted paths
    if (isPinned) return "#ff6b6b"; // Red for pinned paths
    return stroke; // Default stroke color
  };
  
  const getStrokeWidth = () => {
    if (isHighlighted) return pathStrokeWidth + 2; // Thicker for highlighted
    if (isPinned) return pathStrokeWidth + 1; // Slightly thicker for pinned
    return pathStrokeWidth;
  };

  return (
    <g className="path-group">
      {/* Invisible wide stroke for better hover detection */}
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke="transparent"
        strokeWidth="12"
        className="path-hit-area"
        {...touchEvents}
      />
      {/* Visible path line */}
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={getStrokeColor()}
        strokeWidth={getStrokeWidth()}
        className={`tree-path ${isPinned ? 'pinned' : ''} ${isHighlighted ? 'highlighted' : ''}`}
      />
      {/* Hebrew letter caption */}
      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="central"
        className="path-letter"
        fill={isHighlighted ? "#ffd700" : "#ffffff"}
        fontSize="16"
        fontWeight="bold"
      >
        {metadata.hebrewLetter}
      </text>
    </g>
  );
};

export default Path;
