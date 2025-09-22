import React, { useState, useMemo } from 'react';
import treeConfig from '../treeOfLifeConfig.json';
import musicalSystems from '../musicalSystems.json';
import InfoPanel from './InfoPanel';
import VisualizationPicker from './VisualizationPicker';
import WorldSelector from './WorldSelector';
import MusicSystemPicker from './MusicSystemPicker';
import WorldInfo from './WorldInfo';
import Sephirah from './Sephirah';
import Path from './Path';
import AudioService from './AudioService';
import { findPathsBelow, findPathsAbove, patchMusicalNotes, validateMusicalSystem } from '../utils/treeOfLifeUtils';
import type { SephirahData, PathData, PinnedState, HoverState } from '../types/treeOfLife';

const TreeOfLife: React.FC = () => {
  const { sephirot, styling, worlds } = treeConfig;
  const [selectedWorld, setSelectedWorld] = useState<string>('briah');
  const [viewMode, setViewMode] = useState<string>('sphere');
  const [selectedMusicalSystem, setSelectedMusicalSystem] = useState<string>('Paul_Foster_Case');
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
  const [chordNotes, setChordNotes] = useState<{
    above: string[];
    below: string[];
  }>({ above: [], below: [] });

  // Pure function to get current musical system
  const getCurrentMusicalSystem = (systemKey: string) => (musicalSystems as Record<string, any>)[systemKey];

  // Memoized patched configuration with musical notes
  const patchedConfig = useMemo(() => {
    const currentSystem = getCurrentMusicalSystem(selectedMusicalSystem);
    
    if (!currentSystem) {
      console.warn(`Musical system '${selectedMusicalSystem}' not found, using original config`);
      return treeConfig;
    }

    // Validate the musical system
    const requiredPathNumbers = Array.from({ length: 22 }, (_, i) => i + 11); // 11-32
    const validation = validateMusicalSystem(currentSystem, requiredPathNumbers);
    
    if (!validation.isValid) {
      console.warn(
        `Musical system '${selectedMusicalSystem}' is missing assignments for paths: ${validation.missingPaths.join(', ')}`
      );
    }

    return patchMusicalNotes(treeConfig, currentSystem);
  }, [selectedMusicalSystem]);

  // Extract patched paths for use throughout the component
  const patchedPaths = patchedConfig.paths;

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
    // Find paths above and below the sephirah
    const pathsAbove = findPathsAbove(sephirah.name, patchedPaths);
    const pathsBelow = findPathsBelow(sephirah.name, patchedPaths);
    
    console.log(`🎵 TreeOfLife: Sephirah ${sephirah.name} clicked!`);
    console.log(`🎵 TreeOfLife: Paths above:`, pathsAbove.map(p => ({
      pathNumber: p.pathNumber,
      hebrewLetter: p.hebrewLetter,
      musicalNote: p.musicalNote
    })));
    console.log(`🎵 TreeOfLife: Paths below:`, pathsBelow.map(p => ({
      pathNumber: p.pathNumber,
      hebrewLetter: p.hebrewLetter,
      musicalNote: p.musicalNote
    })));
    
    // Highlight only below paths briefly
    const belowPathNumbers = new Set(pathsBelow.map(path => path.pathNumber));
    setHighlightedPaths(belowPathNumbers);
    
    // Clear highlighting after 2 seconds
    setTimeout(() => {
      setHighlightedPaths(new Set());
    }, 2000);
    
    // Update chord notes for info panel (both above and below)
    const aboveChordNotes = pathsAbove.map(path => path.musicalNote);
    const belowChordNotes = pathsBelow.map(path => path.musicalNote);
    setChordNotes({ above: aboveChordNotes, below: belowChordNotes });
    
    // Play only below chord if there are below paths
    if (pathsBelow.length > 0) {
      console.log(`🎵 TreeOfLife: Playing below chord with notes:`, belowChordNotes);
      
      if (typeof (window as any).playTreeOfLifeChord === 'function') {
        (window as any).playTreeOfLifeChord(belowChordNotes);
      } else {
        console.error('🎵 TreeOfLife: playTreeOfLifeChord function not found on window object');
      }
    } else {
      console.log(`🎵 TreeOfLife: No below paths for ${sephirah.name}, skipping chord playback`);
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

  const handleMusicalSystemChange = (systemKey: string) => {
    setSelectedMusicalSystem(systemKey);
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
        {/* <WorldInfo world={currentWorld} /> */}
        
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