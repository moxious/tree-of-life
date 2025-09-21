import React from 'react';

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
  onHover: (sephirah: any) => void;
  onLeave: () => void;
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
  onLeave 
}) => {
  return (
    <g 
      className={`sephirah-group ${viewMode === 'card' ? 'card-mode' : 'sphere-mode'}`}
      data-name={name}
      onMouseEnter={() => onHover({ name, metadata, worldColors })}
      onMouseLeave={onLeave}
    >
      <circle
        cx={position.x}
        cy={position.y}
        r={radius}
        fill={image ? `url(#${name}-pattern)` : color}
        className="sephirah"
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
