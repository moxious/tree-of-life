import React from 'react';
import { useAudio } from '../contexts/AudioContext';
import type { NowPlayingEntry } from '../types/audio';

const NowPlaying: React.FC = () => {
  const { state } = useAudio();
  const { nowPlaying } = state;

  // Pure function to format notes for display
  const formatNotes = (notes: string[]): string => {
    return notes.join(', ');
  };

  // Pure function to render now playing entry
  const renderNowPlayingEntry = (entry: NowPlayingEntry) => (
    <div key={entry.id} className="now-playing-entry">
      <span className="entry-source">{entry.source}:</span>
      <span className="entry-notes">{formatNotes(entry.notes)}</span>
    </div>
  );

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
