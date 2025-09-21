import React from 'react';

interface PathProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  stroke: string;
  strokeWidth: number;
  metadata: {
    pathNumber: number;
    hebrewLetter: string;
    hebrewLetterName: string;
    tarotCard: string;
    tarotNumber: number;
    astrologicalSign: string;
    astrologicalSymbol: string;
    element: string;
    letterMeaning: string;
    musicalNote: string;
    gematriaValue: number;
  };
  onHover: (pathData: any) => void;
  onLeave: () => void;
}

const Path: React.FC<PathProps> = ({ from, to, stroke, strokeWidth, metadata, onHover, onLeave }) => {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

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

  return (
    <g className="path-group">
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={stroke}
        strokeWidth={pathStrokeWidth}
        className="tree-path"
        onMouseEnter={() => onHover(metadata)}
        onMouseLeave={onLeave}
      />
      {/* Hebrew letter caption */}
      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="central"
        className="path-letter"
        fill="#ffffff"
        fontSize="16"
        fontWeight="bold"
      >
        {metadata.hebrewLetter}
      </text>
    </g>
  );
};

export default Path;
