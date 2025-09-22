import React, { useState } from 'react';
import treeConfig from '../treeOfLifeConfig.json';
import musicalSystems from '../musicalSystems.json';
import InfoPanel from './InfoPanel';
import VisualizationPicker from './VisualizationPicker';
import WorldSelector from './WorldSelector';
import MusicSystemPicker from './MusicSystemPicker';
import MusicControl from './MusicControl';
import Sephirah from './Sephirah';
import Path from './Path';
import AudioService from './AudioService';
import { useHoverState } from '../hooks/useHoverState';
import { usePinnedState } from '../hooks/usePinnedState';
import { useMusicalSystem } from '../hooks/useMusicalSystem';
import { useTreeInteractions } from '../hooks/useTreeInteractions';
import type { SephirahData, PathData } from '../types/treeOfLife';

const TreeOfLife: React.FC = () => {
  const { sephirot, styling, worlds } = treeConfig;
  const [selectedWorld, setSelectedWorld] = useState<string>('briah');
  const [viewMode, setViewMode] = useState<string>('sphere');

  // Use custom hooks for state management
  const {
    hoverState,
    handleSephirahHover,
    handleSephirahLeave,
    handlePathHover,
    handlePathLeave
  } = useHoverState();

  const {
    pinnedState,
    toggleSephirahPin,
    togglePathPin,
    unpinSephirah,
    unpinPath
  } = usePinnedState();

  const {
    selectedMusicalSystem,
    patchedPaths,
    handleMusicalSystemChange
  } = useMusicalSystem();

  const {
    highlightedPaths,
    chordNotes,
    handlePathClick,
    handleSephirahClick
  } = useTreeInteractions(patchedPaths);

  // Wrapper functions to pass pinned state to hover handlers
  const handleSephirahHoverWithPinned = (sephirah: SephirahData) => {
    handleSephirahHover(sephirah, pinnedState.isSephirahPinned || pinnedState.isPathPinned);
  };

  const handlePathHoverWithPinned = (pathData: PathData) => {
    handlePathHover(pathData, pinnedState.isSephirahPinned || pinnedState.isPathPinned);
  };

  // Wrapper functions for click handlers
  const handlePathClickWithPin = (pathData: PathData) => {
    handlePathClick(pathData, togglePathPin);
  };

  const handleSephirahClickWithPin = (sephirah: SephirahData) => {
    handleSephirahClick(sephirah, toggleSephirahPin);
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

  const currentImages = getCurrentWorldImages();

  return (
    <div className="tree-of-life-app">
      <AudioService />
      
      <div className="app-header">
        {/* <WorldInfo world={currentWorld} /> */}
        
        <div className="controls">
          <MusicControl />
          
          <WorldSelector 
            selectedWorld={selectedWorld}
            onWorldChange={handleWorldChange}
            worlds={worlds}
          />
          
          <VisualizationPicker 
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          />

          <MusicSystemPicker
            selectedSystem={selectedMusicalSystem}
            onSystemChange={handleMusicalSystemChange}
            musicalSystems={musicalSystems}
          />
        </div>
      </div>

      <div className="app-main">
        <div className="tree-of-life-container">
          <svg
            width="800"
            height="700"
            viewBox="0 0 800 700"
            className="tree-of-life-svg"
          >
            {/* Render paths first so they appear behind circles */}
            {patchedPaths.map((path: PathData, index: number) => {
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
                    gematriaValue: path.gematriaValue,
                    from: path.from,
                    to: path.to
                  }}
                  onHover={handlePathHoverWithPinned}
                  onLeave={handlePathLeave}
                  onPathClick={handlePathClickWithPin}
                  isPinned={pinnedState.path?.pathNumber === path.pathNumber}
                  isHighlighted={highlightedPaths.has(path.pathNumber)}
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
                onHover={handleSephirahHoverWithPinned}
                onLeave={handleSephirahLeave}
                onSephirahClick={handleSephirahClickWithPin}
                isPinned={pinnedState.sephirah?.name === key}
              />
            ))}
          </svg>
        </div>
        
        <InfoPanel 
          sephirah={pinnedState.isSephirahPinned ? pinnedState.sephirah : hoverState.sephirah} 
          pathData={pinnedState.isPathPinned ? pinnedState.path : hoverState.path}
          isPathPinned={pinnedState.isPathPinned}
          onUnpinPath={unpinPath}
          isSephirahPinned={pinnedState.isSephirahPinned}
          onUnpinSephirah={unpinSephirah}
          selectedWorld={selectedWorld}
          chordNotes={chordNotes}
        />
      </div>
    </div>
  );
};

export default TreeOfLife; 