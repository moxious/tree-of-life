import React, { useState, useEffect } from 'react';

interface MusicalSystem {
  system: string;
  description: string;
  assignments: Record<string, string>;
  world?: string;
}

interface MusicSystemPickerProps {
  selectedSystem: string;
  onSystemChange: (systemKey: string) => void;
  musicalSystems: Record<string, MusicalSystem>;
  world: string;
}

const MusicSystemPicker: React.FC<MusicSystemPickerProps> = ({ 
  selectedSystem, 
  onSystemChange, 
  musicalSystems,
  world
}) => {
  const [currentSelection, setCurrentSelection] = useState(selectedSystem);
  
  // Sync state with prop changes
  useEffect(() => {
    setCurrentSelection(selectedSystem);
  }, [selectedSystem]);
  
  useEffect(() => {
    const filtered = filterMusicalSystems(musicalSystems, world);
    const currentSystem = musicalSystems[currentSelection];
    
    // If current selection is not compatible with new world, replace it
    if (currentSystem && currentSystem.world && currentSystem.world !== world) {
      const firstCompatible = filtered.find(([, system]) => system.world === world);
      if (firstCompatible) {
        const [newKey] = firstCompatible;
        console.log('firstCompatible', newKey);
        setCurrentSelection(newKey);
        onSystemChange(newKey);
      }
    }
  }, [world, musicalSystems, currentSelection, onSystemChange]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value;
    setCurrentSelection(newValue);
    onSystemChange(newValue);
  };

  const filterMusicalSystems = (musicalSystems: Record<string, MusicalSystem>, world: string) => {
    return Object.entries(musicalSystems).filter(([, system]) => {
      if (!system.world) { return true; }
      if (system.world === world) { return true; }
      return false;
    });
  };
  
  const filtered = filterMusicalSystems(musicalSystems, world);

  return (
    <div className="music-system-picker">
      <label className="picker-label">
        Musical System:
      </label>
      <select 
        className="music-system-select"
        value={currentSelection}
        onChange={handleChange}
      >
        {filtered.map(([key, system]) => (
          <option key={key} value={key}>
            {system.system}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MusicSystemPicker;
