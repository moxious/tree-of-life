import React from 'react';

interface VisualizationPickerProps {
  viewMode: string;
  onViewModeChange: (mode: string) => void;
}

const VisualizationPicker: React.FC<VisualizationPickerProps> = ({ viewMode, onViewModeChange }) => {
  const modes = [
    { key: 'sphere', label: 'Sphere' },
    { key: 'card', label: 'Card' }
  ];

  return (
    <div className="control-container control-container--horizontal">
      {modes.map(({ key, label }) => (
        <button
          key={key}
          className={`world-button ${viewMode === key ? 'active' : ''}`}
          onClick={() => onViewModeChange(key)}
        >
          <span className="world-english">{label}</span>
          <span className="world-english" style={{ opacity: 0 }}>placeholder</span>
        </button>
      ))}
    </div>
  );
};

export default VisualizationPicker;
