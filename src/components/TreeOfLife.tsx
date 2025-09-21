import React, { useState } from 'react';
import treeConfig from '../treeOfLifeConfig.json';
import InfoPanel from './InfoPanel';
import VisualizationPicker from './VisualizationPicker';
import WorldSelector from './WorldSelector';
import WorldInfo from './WorldInfo';
import Sephirah from './Sephirah';
import Path from './Path';
import AudioService from './AudioService';
import { findIncidentPaths } from '../utils/treeOfLifeUtils';
import type { SephirahData, PathData, PinnedState, HoverState } from '../types/treeOfLife';

const TreeOfLife: React.FC = () => {
  const { sephirot, paths, styling, worlds } = treeConfig;
  const [selectedWorld, setSelectedWorld] = useState<string>('briah');
  const [viewMode, setViewMode] = useState<string>('sphere');
  // Hover state
  const [hoverState, setHoverState] = useState<HoverState>({
    sephirah: null,
    path: null,
    activeHoveredSephirah: null
  });

  // Pinned state
  const [pinnedState, setPinnedState] = useState<PinnedState>({
    sephirah: null,
    path: null,
    isSephirahPinned: false,
    isPathPinned: false
  });

  // Highlighted paths state for chord visual feedback
  const [highlightedPaths, setHighlightedPaths] = useState<Set<number>>(new Set());
  
  // Chord notes state for info panel
  const [chordNotes, setChordNotes] = useState<string[]>([]);

  const handleSephirahHover = (sephirah: SephirahData) => {
    // Don't show hover info if something is pinned
    if (pinnedState.isSephirahPinned || pinnedState.isPathPinned) {
      return;
    }
    
    // Only allow hover if no other sephirah is currently hovered
    // or if this is the same sephirah (for card mode transitions)
    if (!hoverState.activeHoveredSephirah || hoverState.activeHoveredSephirah === sephirah.name) {
      setHoverState({
        sephirah,
        path: null,
        activeHoveredSephirah: sephirah.name
      });
    }
  };

  const handleSephirahLeave = () => {
    setHoverState({
      sephirah: null,
      path: hoverState.path,
      activeHoveredSephirah: null
    });
  };

  const handlePathHover = (pathData: PathData) => {
    // Don't show hover info if something is pinned
    if (pinnedState.isSephirahPinned || pinnedState.isPathPinned) {
      return;
    }
    
    setHoverState({
      sephirah: null,
      path: pathData,
      activeHoveredSephirah: null
    });
  };

  const handlePathLeave = () => {
    setHoverState({
      sephirah: hoverState.sephirah,
      path: null,
      activeHoveredSephirah: hoverState.activeHoveredSephirah
    });
  };

  const handlePathClick = (pathData: PathData) => {
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
    
    if (pinnedState.path && pinnedState.path.pathNumber === pathData.pathNumber) {
      // Unpin if clicking the same path
      setPinnedState({
        sephirah: null,
        path: null,
        isSephirahPinned: false,
        isPathPinned: false
      });
    } else {
      // Pin new path and clear sephirah pin
      setPinnedState({
        sephirah: null,
        path: pathData,
        isSephirahPinned: false,
        isPathPinned: true
      });
    }
  };

  const handleUnpinPath = () => {
    setPinnedState({
      sephirah: pinnedState.sephirah,
      path: null,
      isSephirahPinned: pinnedState.isSephirahPinned,
      isPathPinned: false
    });
  };

  const handleSephirahClick = (sephirah: SephirahData) => {
    // Find incident paths for the sephirah
    const incidentPaths = findIncidentPaths(sephirah.name, paths);
    console.log(`🎵 TreeOfLife: Sephirah ${sephirah.name} clicked!`);
    console.log(`🎵 TreeOfLife: Incident paths:`, incidentPaths.map(p => ({
      pathNumber: p.pathNumber,
      hebrewLetter: p.hebrewLetter,
      musicalNote: p.musicalNote
    })));
    
    // Highlight incident paths briefly
    const incidentPathNumbers = new Set(incidentPaths.map(path => path.pathNumber));
    setHighlightedPaths(incidentPathNumbers);
    
    // Clear highlighting after 2 seconds
    setTimeout(() => {
      setHighlightedPaths(new Set());
    }, 2000);
    
    // Play chord if there are incident paths (skip Da'ath)
    if (incidentPaths.length > 0) {
      const chordNotes = incidentPaths.map(path => path.musicalNote);
      console.log(`🎵 TreeOfLife: Playing chord with notes:`, chordNotes);
      
      // Update chord notes for info panel
      setChordNotes(chordNotes);
      
      if (typeof (window as any).playTreeOfLifeChord === 'function') {
        (window as any).playTreeOfLifeChord(chordNotes);
      } else {
        console.error('🎵 TreeOfLife: playTreeOfLifeChord function not found on window object');
      }
    } else {
      console.log(`🎵 TreeOfLife: No incident paths for ${sephirah.name}, skipping chord playback`);
      setChordNotes([]);
    }
    
    if (pinnedState.sephirah && pinnedState.sephirah.name === sephirah.name) {
      // Unpin if clicking the same sephirah
      setPinnedState({
        sephirah: null,
        path: pinnedState.path,
        isSephirahPinned: false,
        isPathPinned: pinnedState.isPathPinned
      });
    } else {
      // Pin new sephirah and clear path pin
      setPinnedState({
        sephirah,
        path: null,
        isSephirahPinned: true,
        isPathPinned: false
      });
    }
  };

  const handleUnpinSephirah = () => {
    setPinnedState({
      sephirah: null,
      path: pinnedState.path,
      isSephirahPinned: false,
      isPathPinned: pinnedState.isPathPinned
    });
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
      <AudioService />
      
      <div className="app-header">
        <WorldInfo world={currentWorld} />
        
        <div className="controls">
          <WorldSelector 
            selectedWorld={selectedWorld}
            onWorldChange={handleWorldChange}
            worlds={worlds}
          />
          
          <VisualizationPicker 
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
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
                    gematriaValue: path.gematriaValue,
                    from: path.from,
                    to: path.to
                  }}
                  onHover={handlePathHover}
                  onLeave={handlePathLeave}
                  onPathClick={handlePathClick}
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
                onHover={handleSephirahHover}
                onLeave={handleSephirahLeave}
                onSephirahClick={handleSephirahClick}
                isPinned={pinnedState.sephirah?.name === key}
              />
            ))}
          </svg>
        </div>
        
        <InfoPanel 
          sephirah={pinnedState.isSephirahPinned ? pinnedState.sephirah : hoverState.sephirah} 
          pathData={pinnedState.isPathPinned ? pinnedState.path : hoverState.path}
          isPathPinned={pinnedState.isPathPinned}
          onUnpinPath={handleUnpinPath}
          isSephirahPinned={pinnedState.isSephirahPinned}
          onUnpinSephirah={handleUnpinSephirah}
          selectedWorld={selectedWorld}
          chordNotes={chordNotes}
        />
      </div>
    </div>
  );
};

export default TreeOfLife; 