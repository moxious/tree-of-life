import React, { useState } from 'react';
import treeConfig from '../treeOfLifeConfig.json';

interface SephirahProps {
  name: string;
  position: { x: number; y: number };
  color: string;
  image: string | null;
  radius: number;
  metadata: {
    hebrewName: string;
    englishName: string;
    planetaryCorrespondence: string;
    planetarySymbol: string;
    element: string;
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
  metadata, 
  onHover, 
  onLeave 
}) => {
  return (
    <g 
      className="sephirah-group"
      data-name={name}
      onMouseEnter={() => onHover({ name, metadata })}
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
      // Keter to Chokmah
      { fromPos: { x: 400, y: 50 }, toPos: { x: 550, y: 150 } },
      // Chokmah to Binah  
      { fromPos: { x: 550, y: 150 }, toPos: { x: 250, y: 150 } },
      // Chesed to Gevurah (Lightning Flash crosses the abyss conceptually)
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

interface InfoPanelProps {
  sephirah: {
    name: string;
    metadata: {
      hebrewName: string;
      englishName: string;
      planetaryCorrespondence: string;
      planetarySymbol: string;
      element: string;
    };
  } | null;
  pathData: {
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
  } | null;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ sephirah, pathData }) => {
  if (!sephirah && !pathData) {
    return (
      <div className="info-panel">
        <div className="info-panel-content">
          <h3>Tree of Life</h3>
          <p>Hover over a sephirah or path to see its correspondences.</p>
        </div>
      </div>
    );
  }

  if (sephirah) {
    return (
      <div className="info-panel">
        <div className="info-panel-content">
          <div className="info-header">
            <h3>{sephirah.name}</h3>
          </div>
          <table className="info-table">
            <tbody>
              <tr>
                <td className="label">Hebrew:</td>
                <td className="value hebrew-text">{sephirah.metadata.hebrewName}</td>
              </tr>
              <tr>
                <td className="label">English:</td>
                <td className="value">{sephirah.metadata.englishName}</td>
              </tr>
              <tr>
                <td className="label">Planetary:</td>
                <td className="value">{sephirah.metadata.planetarySymbol} {sephirah.metadata.planetaryCorrespondence}</td>
              </tr>
              <tr>
                <td className="label">Element:</td>
                <td className="value">{sephirah.metadata.element}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (pathData) {
    return (
      <div className="info-panel">
        <div className="info-panel-content">
          <div className="info-header">
            <h3>Path {pathData.pathNumber}</h3>
          </div>
          <table className="info-table">
            <tbody>
              <tr>
                <td className="label">Hebrew Letter:</td>
                <td className="value hebrew-text">{pathData.hebrewLetter}</td>
              </tr>
              <tr>
                <td className="label">Letter Name:</td>
                <td className="value">{pathData.hebrewLetterName}</td>
              </tr>
              <tr>
                <td className="label">Letter Meaning:</td>
                <td className="value">{pathData.letterMeaning}</td>
              </tr>
              <tr>
                <td className="label">Gematria Value:</td>
                <td className="value">{pathData.gematriaValue}</td>
              </tr>
              <tr>
                <td className="label">Tarot Card:</td>
                <td className="value">{pathData.tarotCard}</td>
              </tr>
              <tr>
                <td className="label">Tarot Number:</td>
                <td className="value">{pathData.tarotNumber}</td>
              </tr>
              <tr>
                <td className="label">Astrological:</td>
                <td className="value">{pathData.astrologicalSymbol} {pathData.astrologicalSign}</td>
              </tr>
              <tr>
                <td className="label">Element:</td>
                <td className="value">{pathData.element}</td>
              </tr>
              <tr>
                <td className="label">Musical Note:</td>
                <td className="value">{pathData.musicalNote}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
};

interface WorldSelectorProps {
  selectedWorld: string;
  onWorldChange: (world: string) => void;
  worlds: any;
}

const WorldSelector: React.FC<WorldSelectorProps> = ({ selectedWorld, onWorldChange, worlds }) => {
  // Define the order and transliterations
  const worldOrder = [
    { key: 'assiah', transliteration: 'Assiah' },
    { key: 'yetzirah', transliteration: 'Yetzirah' },
    { key: 'briah', transliteration: 'Briah' },
    { key: 'atziluth', transliteration: 'Atziluth' }
  ];

  return (
    <div className="world-selector">
      {worldOrder.map(({ key, transliteration }) => {
        const world = worlds[key];
        return (
          <button
            key={key}
            className={`world-button ${selectedWorld === key ? 'active' : ''}`}
            onClick={() => onWorldChange(key)}
          >
            <span className="world-hebrew">{world.metadata.hebrewName}</span>
            <span className="world-english">{transliteration}</span>
          </button>
        );
      })}
    </div>
  );
};

interface WorldInfoProps {
  world: any;
}

const WorldInfo: React.FC<WorldInfoProps> = ({ world }) => {
  return (
    <div className="world-info">
      <h1 className="world-title">
        <span className="world-title-hebrew">{world.metadata.hebrewName}</span>
        <span className="world-title-english">{world.metadata.englishName}</span>
      </h1>
      <p className="world-description">{world.metadata.description}</p>
    </div>
  );
};

const TreeOfLife: React.FC = () => {
  const { sephirot, paths, styling, worlds } = treeConfig;
  const [selectedWorld, setSelectedWorld] = useState<string>('briah');
  const [hoveredSephirah, setHoveredSephirah] = useState<{
    name: string;
    metadata: {
      hebrewName: string;
      englishName: string;
      planetaryCorrespondence: string;
      planetarySymbol: string;
      element: string;
    };
  } | null>(null);
  
  const [hoveredPath, setHoveredPath] = useState<{
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
  } | null>(null);

  const handleSephirahHover = (
    sephirah: { 
      name: string; 
      metadata: { 
        hebrewName: string; 
        englishName: string;
        planetaryCorrespondence: string;
        planetarySymbol: string;
        element: string;
      } 
    }
  ) => {
    setHoveredSephirah(sephirah);
    // Clear path when hovering sephirah
    setHoveredPath(null);
  };

  const handleSephirahLeave = () => {
    setHoveredSephirah(null);
  };

  const handlePathHover = (
    pathData: { 
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
    }
  ) => {
    setHoveredPath(pathData);
    // Clear sephirah when hovering path
    setHoveredSephirah(null);
  };

  const handlePathLeave = () => {
    setHoveredPath(null);
  };

  const handleWorldChange = (world: string) => {
    setSelectedWorld(world);
  };

  const getCurrentWorldImages = () => {
    return worlds[selectedWorld as keyof typeof worlds]?.images || {};
  };

  const currentWorld = worlds[selectedWorld as keyof typeof worlds];
  const currentImages = getCurrentWorldImages();

  return (
    <div className="tree-of-life-app">
      {/* Header */}
      <div className="app-header">
        {/* World Info */}
        <WorldInfo world={currentWorld} />
        
        {/* World Selector */}
        <WorldSelector 
          selectedWorld={selectedWorld}
          onWorldChange={handleWorldChange}
          worlds={worlds}
        />
      </div>

      {/* Main Content */}
      <div className="app-main">
        {/* Tree of Life */}
        <div className="tree-of-life-container">
          <svg
            width="800"
            height="700"
            viewBox="0 0 800 700"
            className="tree-of-life-svg"
          >
            {/* Render paths first so they appear behind circles */}
            {paths.map((path, index) => {
              const fromSephirah = sephirot[path.from as keyof typeof sephirot];
              const toSephirah = sephirot[path.to as keyof typeof sephirot];
              
              return (
                <Path
                  key={index}
                  from={fromSephirah.position}
                  to={toSephirah.position}
                  stroke={styling.pathStroke}
                  strokeWidth={styling.pathStrokeWidth}
                  metadata={{
                    pathNumber: path.pathNumber,
                    hebrewLetter: path.hebrewLetter,
                    hebrewLetterName: path.hebrewLetterName,
                    tarotCard: path.tarotCard,
                    tarotNumber: path.tarotNumber,
                    astrologicalSign: path.astrologicalSign,
                    astrologicalSymbol: path.astrologicalSymbol,
                    element: path.element,
                    letterMeaning: path.letterMeaning,
                    musicalNote: path.musicalNote,
                    gematriaValue: path.gematriaValue
                  }}
                  onHover={handlePathHover}
                  onLeave={handlePathLeave}
                />
              );
            })}
            
            {/* Render circles */}
            {Object.entries(sephirot).map(([key, sephirah]) => (
              <Sephirah
                key={key}
                name={key}
                position={sephirah.position}
                color={sephirah.color}
                image={currentImages[key as keyof typeof currentImages] || sephirah.image}
                radius={styling.circleRadius}
                metadata={sephirah.metadata}
                onHover={handleSephirahHover}
                onLeave={handleSephirahLeave}
              />
            ))}
          </svg>
        </div>
        
        {/* Info Panel */}
        <InfoPanel 
          sephirah={hoveredSephirah} 
          pathData={hoveredPath}
        />
      </div>
    </div>
  );
};

export default TreeOfLife; 