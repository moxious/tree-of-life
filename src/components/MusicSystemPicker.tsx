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
  // Pure function to get system options
  const getSystemOptions = (systems: Record<string, MusicalSystem>) => 
    Object.entries(systems).map(([key, system]) => ({
      key,
      name: system.system,
      description: system.description
    }));

  // Pure function to render option text with line break
  const renderOptionText = (name: string, description: string) => 
    description ? `${name}\n${description}` : name;

  const systemOptions = getSystemOptions(musicalSystems);

  return (
    <div className="music-system-picker">
      <label htmlFor="musical-system-select" className="picker-label">
        Musical System:
      </label>
      <select
        id="musical-system-select"
        value={selectedSystem}
        onChange={(e) => onSystemChange(e.target.value)}
        className="musical-system-select"
      >
        {systemOptions.map(({ key, name, description }) => (
          <option 
            key={key} 
            value={key} 
            title={description}
            style={{ whiteSpace: 'pre-line' }}
          >
            {renderOptionText(name, description)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MusicSystemPicker;
