import React from 'react';

interface ChordPickerProps {
  chordType: string;
  onChordTypeChange: (type: string) => void;
}

const ChordPicker: React.FC<ChordPickerProps> = ({ chordType, onChordTypeChange }) => {
  const chordTypes = [
    { key: 'below', label: '↓' },
    { key: 'above', label: '↑' },
    { key: 'triad', label: '△' }
  ];

  return (
    <div className="chord-picker">
      {chordTypes.map(({ key, label }) => (
        <button
          key={key}
          className={`world-button ${chordType === key ? 'active' : ''}`}
          onClick={() => onChordTypeChange(key)}
          title={`${key.charAt(0).toUpperCase() + key.slice(1)} chord`}
        >
          <span className="world-english">{label}</span>
          <span className="world-english" style={{ opacity: 0 }}>placeholder</span>
        </button>
      ))}
    </div>
  );
};

export default ChordPicker;
