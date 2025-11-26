import React from 'react';
import { getAllPresets } from '../config/synthPresets';
import type { SynthPreset } from '../types/synthPresets';

interface SynthPickerProps {
  currentPreset: string;
  onPresetChange: (presetId: string) => void;
}

const SynthPicker: React.FC<SynthPickerProps> = ({ 
  currentPreset, 
  onPresetChange 
}) => {
  const presets: SynthPreset[] = getAllPresets();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onPresetChange(event.target.value);
  };

  return (
    <div className="synth-picker">
      <label className="picker-label">
        Synth:
      </label>
      <select 
        className="synth-select"
        value={currentPreset}
        onChange={handleChange}
      >
        {presets.map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SynthPicker;

