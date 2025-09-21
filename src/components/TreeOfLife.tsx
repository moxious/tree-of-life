import React, { useState } from 'react';
import treeConfig from '../treeOfLifeConfig.json';
import InfoPanel from './InfoPanel';
import VisualizationPicker from './VisualizationPicker';
import WorldSelector from './WorldSelector';
import WorldInfo from './WorldInfo';
import Sephirah from './Sephirah';
import Path from './Path';







const TreeOfLife: React.FC = () => {
  const { sephirot, paths, styling, worlds } = treeConfig;
  const [selectedWorld, setSelectedWorld] = useState<string>('briah');
  const [viewMode, setViewMode] = useState<string>('sphere');
  const [hoveredSephirah, setHoveredSephirah] = useState<{
    name: string;
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
      };
      worldColors: {
        assiah: { color: string };
        yetzirah: { color: string };
        briah: { color: string };
        atziluth: { color: string };
      };
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

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode);
  };

  const getCurrentWorldImages = () => {
    const world = worlds[selectedWorld as keyof typeof worlds];
    if (!world) return {};
    
    return viewMode === 'card' ? world.tarotCards || {} : world.images || {};
  };

  const currentWorld = worlds[selectedWorld as keyof typeof worlds];
  const currentImages = getCurrentWorldImages();

  return (
    <div className="tree-of-life-app">
      {/* Header */}
      <div className="app-header">
        {/* World Info */}
        <WorldInfo world={currentWorld} />
        
        {/* Controls */}
        <div className="controls">
          {/* World Selector */}
          <WorldSelector 
            selectedWorld={selectedWorld}
            onWorldChange={handleWorldChange}
            worlds={worlds}
          />
          
          {/* Visualization Picker */}
          <VisualizationPicker 
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          />
        </div>
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
                worldColors={sephirah.in}
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
          selectedWorld={selectedWorld}
        />
      </div>
    </div>
  );
};

export default TreeOfLife; 