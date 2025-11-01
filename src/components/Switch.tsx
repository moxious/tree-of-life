import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  'aria-label'?: string;
}

const Switch: React.FC<SwitchProps> = ({ 
  checked, 
  onChange, 
  disabled = false,
  'aria-label': ariaLabel 
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <label className="switch-container" aria-label={ariaLabel}>
      <input
        type="checkbox"
        checked={checked}
        onChange={handleToggle}
        disabled={disabled}
        className="switch-input"
      />
      <span className="switch-slider" />
    </label>
  );
};

export default Switch;

