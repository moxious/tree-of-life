import React from 'react';
import treeConfig from '../treeOfLifeConfig.json';
import musicalSystems from '../musicalSystems.json';
import InfoPanel from './InfoPanel';
import CombinedPicker from './CombinedPicker';
import MusicSystemPicker from './MusicSystemPicker';
import NowPlaying from './NowPlaying';
import Sephirah from './Sephirah';
import Path from './Path';
import Switch from './Switch';
import { AudioProvider, useAudio } from '../contexts/AudioContext';
import AudioErrorBoundary from './AudioErrorBoundary';
import { useTreeState } from '../hooks/useTreeState';
import { useMultiTouch } from '../hooks/useMultiTouch';
import type { PathData } from '../types/treeOfLife';

// Inner component that uses audio context
const TreeOfLifeInner: React.FC = () => {
  const { sephirot, styling, worlds } = treeConfig;
  const { state: audioState, actions: audioActions } = useAudio();

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
    chordType,
    editMode
  } = useTreeState(audioActions);

  // Debug logging for editMode
  console.log('🎵 TreeOfLife editMode:', editMode);

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
        <CombinedPicker
            selectedWorld={selectedWorld}
            onWorldChange={actions.changeSelectedWorld}
            worlds={worlds}
            viewMode={viewMode}
            onViewModeChange={actions.changeViewMode}
          />

          <div className="control-container control-container--vertical control-container--full-width">
            {/* Toggles Row: Audio and Edit */}
            <div className="toggles-row">
              <div className="sound-toggle">
                <label className="picker-label">
                  Audio:
                </label>
                <Switch
                  checked={audioState.soundEnabled}
                  onChange={audioActions.setSoundEnabled}
                  aria-label="Toggle audio on or off"
                />
              </div>
              <div className="edit-toggle">
                <label className="picker-label">
                  Edit:
                </label>
                <Switch
                  checked={editMode}
                  onChange={actions.toggleEditMode}
                  aria-label="Toggle edit mode"
                />
              </div>
            </div>
            
            {/* Error Display */}
            {audioState.error && (
              <div className="audio-error">
                <span className="error-text">Audio Error: {audioState.error}</span>
                <button onClick={audioActions.clearError} className="clear-error-btn">×</button>
              </div>
            )}
            
            <MusicSystemPicker
              selectedSystem={selectedMusicalSystem}
              onSystemChange={actions.changeMusicalSystem}
              musicalSystems={musicalSystems}
              world={selectedWorld}
            />
            
            {/* Chord Selector */}
            <div className="chord-selector">
              <div className="button-group">
                <button
                  className={`world-button ${chordType === 'above' ? 'active' : ''}`}
                  onClick={() => actions.changeChordType('above')}
                  title="Above chord"
                >
                  <span className="world-english">↑</span>
                  <span className="world-english">ABOVE</span>
                </button>
                <button
                  className={`world-button ${chordType === 'below' ? 'active' : ''}`}
                  onClick={() => actions.changeChordType('below')}
                  title="Below chord"
                >
                  <span className="world-english">↓</span>
                  <span className="world-english">BELOW</span>
                </button>
                <button
                  className={`world-button ${chordType === 'triad' ? 'active' : ''}`}
                  onClick={() => actions.changeChordType('triad')}
                  title="Triad chord"
                >
                  <span className="world-english">△</span>
                  <span className="world-english">TRIAD</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {audioState.soundEnabled && <NowPlaying />}
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
                  editMode={editMode}
                  onNoteChange={actions.updateCustomNote}
                />
              );
            })}
            
            {/* Render circles */}
            {Object.entries(sephirot).map(([key, sephirah]) => {
              // Debug logging for Daath
              if (key === 'daath') {
                console.log('🎵 TreeOfLife rendering Daath with editMode:', editMode);
              }
              
              return (
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
                  editMode={editMode}
                />
              );
            })}
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