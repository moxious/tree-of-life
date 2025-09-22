import React from 'react';
import { useAudio } from '../contexts/AudioContext';

const MusicControl: React.FC = () => {
  const { state, actions } = useAudio();
  const { soundEnabled, error, isInitialized } = state;
  const { setSoundEnabled, clearError } = actions;

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
        {(!isInitialized || !soundEnabled) && (
          <div className="audio-status">
            <span className="status-text">Click "On" to permit audio</span>
          </div>
        )}
        {isInitialized && soundEnabled && (
          <div className="audio-status">
            <span className="status-text">Interact with the tree to play</span>
          </div>
        )}
        {error && (
          <div className="audio-error">
            <span className="error-text">Audio Error: {error}</span>
            <button onClick={clearError} className="clear-error-btn">×</button>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default MusicControl;
