import React from 'react';
import treeConfig from '../treeOfLifeConfig.json';
import musicalSystems from '../musicalSystems.json';
import InfoPanel from './InfoPanel';
import CombinedPicker from './CombinedPicker';
import ChordPicker from './ChordPicker';
import MusicSystemPicker from './MusicSystemPicker';
import MusicControl from './MusicControl';
import NowPlaying from './NowPlaying';
import Sephirah from './Sephirah';
import Path from './Path';
import { AudioProvider, useAudio } from '../contexts/AudioContext';
import AudioErrorBoundary from './AudioErrorBoundary';
import { useTreeState } from '../hooks/useTreeState';
import { useMultiTouch } from '../hooks/useMultiTouch';
import type { PathData } from '../types/treeOfLife';

// Inner component that uses audio context
const TreeOfLifeInner: React.FC = () => {
  const { sephirot, styling, worlds } = treeConfig;
  const { actions: audioActions } = useAudio();

  // Use unified hook for all state management with audio actions
  const {
    actions,
    hoverState,
    pinnedState,
    highlightedPaths,
    selectedMusicalSystem,
    patchedPaths,
    selectedWorld,
    viewMode,
    chordType
  } = useTreeState(audioActions);

  const getCurrentWorldImages = () => {
    const world = worlds[selectedWorld as keyof typeof worlds];
    if (!world) return {};
    
    return viewMode === 'card' ? world.tarotCards || {} : world.images || {};
  };

  const currentImages = getCurrentWorldImages();

  // Multi-touch support for multiple chord playing
  const multiTouch = useMultiTouch({
    audioActions,
    onMultiTouchChord: (notes, source) => {
      console.log('🎵 TreeOfLife: Multi-touch chord detected:', notes, source);
      // For now, just play the chord - you could add more sophisticated logic here
      audioActions?.playChord(notes, source);
    }
  });

  return (
    <div className="tree-of-life-app">
      <div className="app-header">
        {/* <WorldInfo world={currentWorld} /> */}
        
        <div className="controls">
          <MusicControl />
          
          <CombinedPicker
            selectedWorld={selectedWorld}
            onWorldChange={actions.changeSelectedWorld}
            worlds={worlds}
            viewMode={viewMode}
            onViewModeChange={actions.changeViewMode}
          />

          <div className="chord-picker-container">
            <ChordPicker
              chordType={chordType}
              onChordTypeChange={actions.changeChordType}
            />

            <MusicSystemPicker
              selectedSystem={selectedMusicalSystem}
              onSystemChange={actions.changeMusicalSystem}
              musicalSystems={musicalSystems}
              world={selectedWorld}
            />
          </div>
        </div>
        
        <NowPlaying />
      </div>

      <div className="app-main">
        <div className="tree-of-life-container">
          <svg
            width="800"
            height="700"
            viewBox="0 0 800 700"
            className="tree-of-life-svg"
            onTouchEnd={multiTouch.handleTouchEnd}
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
                  onHover={actions.handlePathHover}
                  onLeave={actions.handlePathLeave}
                  onPathClick={actions.handlePathClick}
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
                onHover={actions.handleSephirahHover}
                onLeave={actions.handleSephirahLeave}
                onSephirahClick={actions.handleSephirahClick}
                isPinned={pinnedState.sephirah?.name === key}
                onMultiTouchStart={multiTouch.handleTouchStart}
              />
            ))}
          </svg>
        </div>
        
        <InfoPanel 
          sephirah={pinnedState.isSephirahPinned ? pinnedState.sephirah : hoverState.sephirah} 
          pathData={pinnedState.isPathPinned ? pinnedState.path : hoverState.path}
          isPathPinned={pinnedState.isPathPinned}
          onUnpinPath={actions.unpinPath}
          isSephirahPinned={pinnedState.isSephirahPinned}
          onUnpinSephirah={actions.unpinSephirah}
          selectedWorld={selectedWorld}
        />
      </div>
    </div>
  );
};

// Main component with AudioProvider and ErrorBoundary wrapper
const TreeOfLife: React.FC = () => {
  return (
    <AudioErrorBoundary>
      <AudioProvider>
        <TreeOfLifeInner />
      </AudioProvider>
    </AudioErrorBoundary>
  );
};

export default TreeOfLife; 