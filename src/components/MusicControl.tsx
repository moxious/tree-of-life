import React from 'react';
import { useAudio } from '../contexts/AudioContext';
import Switch from './Switch';

const MusicControl: React.FC = () => {
  const { state, actions } = useAudio();
  const { soundEnabled, error } = state;
  const { setSoundEnabled, clearError } = actions;

  return (
    <div className="music-control">
      <div className="control-area">
        <div className="sound-toggle">
          <label className="picker-label">
            Audio:
          </label>
          <Switch
            checked={soundEnabled}
            onChange={setSoundEnabled}
            aria-label="Toggle audio on or off"
          />
        </div>
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
