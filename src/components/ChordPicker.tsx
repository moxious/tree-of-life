import React from 'react';

interface ChordPickerProps {
  chordType: string;
  onChordTypeChange: (type: string) => void;
}

const ChordPicker: React.FC<ChordPickerProps> = ({ chordType, onChordTypeChange }) => {
  const chordTypes = [
    { key: 'above', label: '↑', description: 'Above' },
    { key: 'below', label: '↓', description: 'Below' },
    { key: 'triad', label: '△', description: 'Triad' }
  ];

  return (
    <div className="control-container control-container--horizontal">
      {chordTypes.map(({ key, label, description }) => (
        <button
          key={key}
          className={`world-button ${chordType === key ? 'active' : ''}`}
          onClick={() => onChordTypeChange(key)}
          title={`${key.charAt(0).toUpperCase() + key.slice(1)} chord`}
        >
          <span className="world-english">{label}</span>
          <span className="world-english">{description}</span>
        </button>
      ))}
    </div>
  );
};

export default ChordPicker;
