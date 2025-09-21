import React, { useState } from 'react';
import treeConfig from '../treeOfLifeConfig.json';
import InfoPanel from './InfoPanel';
import VisualizationPicker from './VisualizationPicker';
import WorldSelector from './WorldSelector';
import WorldInfo from './WorldInfo';
import Sephirah from './Sephirah';
import Path from './Path';
import AudioService from './AudioService';

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
  
  const [activeHoveredSephirah, setActiveHoveredSephirah] = useState<string | null>(null);
  
  const [hoveredPath, setHoveredPath] = useState<{
    pathNumber: number;
    hebrewLetter: string;
    hebrewLetterName: string;
    tarotCard: string;
    tarotNumber: number;
    tarotImage: string | null;
    astrologicalSign: string;
    astrologicalSymbol: string;
    element: string;
    elementSymbol: string;
    letterMeaning: string;
    musicalNote: string;
    gematriaValue: number;
  } | null>(null);

  const [pinnedPath, setPinnedPath] = useState<{
    pathNumber: number;
    hebrewLetter: string;
    hebrewLetterName: string;
    tarotCard: string;
    tarotNumber: number;
    tarotImage: string | null;
    astrologicalSign: string;
    astrologicalSymbol: string;
    element: string;
    elementSymbol: string;
    letterMeaning: string;
    musicalNote: string;
    gematriaValue: number;
  } | null>(null);

  const [isPathPinned, setIsPathPinned] = useState<boolean>(false);

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
    // Only allow hover if no other sephirah is currently hovered
    // or if this is the same sephirah (for card mode transitions)
    if (!activeHoveredSephirah || activeHoveredSephirah === sephirah.name) {
      setActiveHoveredSephirah(sephirah.name);
      setHoveredSephirah(sephirah);
      // Clear path when hovering sephirah
      setHoveredPath(null);
    }
  };

  const handleSephirahLeave = () => {
    setActiveHoveredSephirah(null);
    setHoveredSephirah(null);
  };

  const handlePathHover = (
    pathData: { 
      pathNumber: number; 
      hebrewLetter: string; 
      hebrewLetterName: string; 
      tarotCard: string; 
      tarotNumber: number;
      tarotImage: string | null;
      astrologicalSign: string;
      astrologicalSymbol: string;
      element: string;
      elementSymbol: string;
      letterMeaning: string;
      musicalNote: string;
      gematriaValue: number;
    }
  ) => {
    setHoveredPath(pathData);
    // Clear sephirah when hovering path
    setActiveHoveredSephirah(null);
    setHoveredSephirah(null);
  };

  const handlePathLeave = () => {
    setHoveredPath(null);
  };

  const handlePathClick = (pathData: {
    pathNumber: number;
    hebrewLetter: string;
    hebrewLetterName: string;
    tarotCard: string;
    tarotNumber: number;
    tarotImage: string | null;
    astrologicalSign: string;
    astrologicalSymbol: string;
    element: string;
    elementSymbol: string;
    letterMeaning: string;
    musicalNote: string;
    gematriaValue: number;
  }) => {
    console.log('🎵 TreeOfLife: Path clicked!', {
      pathNumber: pathData.pathNumber,
      hebrewLetter: pathData.hebrewLetter,
      musicalNote: pathData.musicalNote
    });
    
    // Play audio for the musical note
    if (typeof (window as any).playTreeOfLifeNote === 'function') {
      console.log('🎵 TreeOfLife: Calling playTreeOfLifeNote with note:', pathData.musicalNote);
      (window as any).playTreeOfLifeNote(pathData.musicalNote);
    } else {
      console.error('🎵 TreeOfLife: playTreeOfLifeNote function not found on window object');
    }
    
    if (pinnedPath && pinnedPath.pathNumber === pathData.pathNumber) {
      // Unpin if clicking the same path
      setPinnedPath(null);
      setIsPathPinned(false);
    } else {
      // Pin new path
      setPinnedPath(pathData);
      setIsPathPinned(true);
    }
  };

  const handleUnpinPath = () => {
    setPinnedPath(null);
    setIsPathPinned(false);
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
      {/* Audio Service */}
      <AudioService />
      
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
                    tarotImage: path.tarotImage,
                    astrologicalSign: path.astrologicalSign,
                    astrologicalSymbol: path.astrologicalSymbol,
                    element: path.element,
                    elementSymbol: path.elementSymbol,
                    letterMeaning: path.letterMeaning,
                    musicalNote: path.musicalNote,
                    gematriaValue: path.gematriaValue
                  }}
                  onHover={handlePathHover}
                  onLeave={handlePathLeave}
                  onPathClick={handlePathClick}
                  isPinned={pinnedPath?.pathNumber === path.pathNumber}
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
                viewMode={viewMode}
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
          pathData={isPathPinned ? pinnedPath : hoveredPath}
          isPathPinned={isPathPinned}
          onUnpinPath={handleUnpinPath}
          selectedWorld={selectedWorld}
        />
      </div>
    </div>
  );
};

export default TreeOfLife; 