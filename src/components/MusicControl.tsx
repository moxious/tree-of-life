import React from 'react';
import { useAudio } from '../contexts/AudioContext';
import type { NowPlayingEntry } from '../types/audio';

const MusicControl: React.FC = () => {
  const { state, actions } = useAudio();
  const { nowPlaying, soundEnabled, error, isInitialized } = state;
  const { setSoundEnabled, clearError } = actions;

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
    <div className="music-control">
      <div className="control-area">
        <label className="picker-label">
          Audio Control:
        </label>
        <div className="sound-toggle">
          <label className="toggle-option">
            <input
              type="radio"
              name="soundEnabled"
              checked={soundEnabled}
              onChange={() => setSoundEnabled(true)}
            />
            <span className="toggle-label">On</span>
          </label>
          <label className="toggle-option">
            <input
              type="radio"
              name="soundEnabled"
              checked={!soundEnabled}
              onChange={() => setSoundEnabled(false)}
            />
            <span className="toggle-label">Off</span>
          </label>
        </div>
        {!isInitialized && (
          <div className="audio-status">
            <span className="status-text">Click "On" to permit audio</span>
          </div>
        )}
        {error && (
          <div className="audio-error">
            <span className="error-text">Audio Error: {error}</span>
            <button onClick={clearError} className="clear-error-btn">×</button>
          </div>
        )}
      </div>
      
      <div className="now-playing-area">
        <label className="picker-label">
          Now Playing:
        </label>
        <div className="now-playing-list">
          {nowPlaying.length === 0 ? (
            <div className="no-sounds">No sounds playing</div>
          ) : (
            nowPlaying.map(renderNowPlayingEntry)
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicControl;
