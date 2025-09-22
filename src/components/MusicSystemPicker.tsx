import React from 'react';

interface MusicalSystem {
  system: string;
  description: string;
  assignments: Record<string, string>;
}

interface MusicSystemPickerProps {
  selectedSystem: string;
  onSystemChange: (systemKey: string) => void;
  musicalSystems: Record<string, MusicalSystem>;
}

const MusicSystemPicker: React.FC<MusicSystemPickerProps> = ({ 
  selectedSystem, 
  onSystemChange, 
  musicalSystems 
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onSystemChange(event.target.value);
  };

  return (
    <div className="music-system-picker">
      <label className="picker-label">
        Musical System:
      </label>
      <select 
        className="music-system-select"
        value={selectedSystem}
        onChange={handleChange}
      >
        {Object.entries(musicalSystems).map(([key, system]) => (
          <option key={key} value={key}>
            {system.system}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MusicSystemPicker;
