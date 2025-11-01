import React from 'react';

interface CombinedPickerProps {
  selectedWorld: string;
  onWorldChange: (world: string) => void;
  worlds: any;
  viewMode: string;
  onViewModeChange: (mode: string) => void;
}

const CombinedPicker: React.FC<CombinedPickerProps> = ({ 
  selectedWorld, 
  onWorldChange, 
  worlds,
  viewMode, 
  onViewModeChange
}) => {
  const worldOrder = [
    { key: 'assiah', transliteration: 'Assiah' },
    { key: 'yetzirah', transliteration: 'Yetzirah' },
    { key: 'briah', transliteration: 'Briah' },
    { key: 'atziluth', transliteration: 'Atziluth' }
  ];

  const modes = [
    { key: 'sphere', label: 'Sphere' },
    { key: 'card', label: 'Card' }
  ];

  return (
    <div className="control-container control-container--vertical control-container--fit-content combined-picker">
      {/* World Selector Button Group */}
      <div className="picker-group">
        {/* <div className="picker-label">World</div> */}
        <div className="button-group">
          {worldOrder.map(({ key, transliteration }) => {
            const world = worlds[key];
            return (
              <button
                key={key}
                className={`world-button ${selectedWorld === key ? 'active' : ''}`}
                onClick={() => onWorldChange(key)}
              >
                <span className="world-hebrew">{world.metadata.hebrewName}</span>
                <span className="world-english">{transliteration}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visualization Picker Button Group */}
      <div className="picker-group">
        {/* <div className="picker-label">View</div> */}
        <div className="button-group">
          {modes.map(({ key, label }) => (
            <button
              key={key}
              className={`world-button ${viewMode === key ? 'active' : ''}`}
              onClick={() => onViewModeChange(key)}
            >
              <span className="world-english">{label}</span>
              <span className="world-english" style={{ opacity: 0 }}>&nbsp;</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CombinedPicker;
