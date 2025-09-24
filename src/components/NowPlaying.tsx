import React from 'react';
import { useAudio } from '../contexts/AudioContext';
import type { NowPlayingEntry } from '../types/audio';
import { createNowPlayingDisplayText } from '../utils/chordDetection';

const NowPlaying: React.FC = () => {
  const { state } = useAudio();
  const { nowPlaying } = state;

  // Pure function to render now playing entry
  const renderNowPlayingEntry = (entry: NowPlayingEntry) => {
    const displayText = createNowPlayingDisplayText(entry.source, entry.notes, entry.detectedChord);
    
    return (
      <div key={entry.id} className="now-playing-entry">
        <span className="entry-text">{displayText}</span>
      </div>
    );
  };

  return (
    <div className="now-playing">
      <div className="now-playing-content">
        <span className="now-playing-label">Now Playing:</span>
        <div className="now-playing-list">
          {nowPlaying.length === 0 ? (
            <span className="no-sounds">(Click the tree to generate sound)</span>
          ) : (
            nowPlaying.map(renderNowPlayingEntry)
          )}
        </div>
      </div>
    </div>
  );
};

export default NowPlaying;
