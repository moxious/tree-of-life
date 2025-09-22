import React, { useState, useRef, useEffect } from 'react';

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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Pure function to get system options
  const getSystemOptions = (systems: Record<string, MusicalSystem>) => 
    Object.entries(systems).map(([key, system]) => ({
      key,
      name: system.system,
      description: system.description
    }));


  const systemOptions = getSystemOptions(musicalSystems);
  const selectedSystemData = musicalSystems[selectedSystem];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSelect = (systemKey: string) => {
    onSystemChange(systemKey);
    setIsOpen(false);
  };

  return (
    <div className="music-system-picker">
      <label className="picker-label">
        Musical System:
      </label>
      <div className="custom-select-container" ref={dropdownRef}>
        <div 
          className={`custom-select ${isOpen ? 'open' : ''}`}
          onClick={handleToggle}
        >
          <span className="selected-text">
            {selectedSystemData ? selectedSystemData.system : selectedSystem}
          </span>
          <span className="dropdown-arrow">▼</span>
        </div>
        
        {isOpen && (
          <div className="custom-select-options">
            {systemOptions.map(({ key, name, description }) => (
              <div
                key={key}
                className={`custom-select-option ${key === selectedSystem ? 'selected' : ''}`}
                onClick={() => handleSelect(key)}
              >
                <div className="option-name">{name}</div>
                <div className="option-description">{description}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicSystemPicker;
