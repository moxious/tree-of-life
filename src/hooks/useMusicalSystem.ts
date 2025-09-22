import { useState, useMemo, useCallback } from 'react';
import treeConfig from '../treeOfLifeConfig.json';
import musicalSystems from '../musicalSystems.json';
import { patchMusicalNotes, validateMusicalSystem } from '../utils/treeOfLifeUtils';

// Custom hook for managing musical system state and configuration
export const useMusicalSystem = () => {
  const [selectedMusicalSystem, setSelectedMusicalSystem] = useState<string>('Paul_Foster_Case');

  // Pure function to get current musical system
  const getCurrentMusicalSystem = useCallback((systemKey: string) => 
    (musicalSystems as Record<string, any>)[systemKey], 
  []);

  // Memoized patched configuration with musical notes
  const patchedConfig = useMemo(() => {
    const currentSystem = getCurrentMusicalSystem(selectedMusicalSystem);
    
    if (!currentSystem) {
      console.warn(`Musical system '${selectedMusicalSystem}' not found, using original config`);
      return treeConfig;
    }

    // Validate the musical system
    const requiredPathNumbers = Array.from({ length: 22 }, (_, i) => i + 11); // 11-32
    const validation = validateMusicalSystem(currentSystem, requiredPathNumbers);
    
    if (!validation.isValid) {
      console.warn(
        `Musical system '${selectedMusicalSystem}' is missing assignments for paths: ${validation.missingPaths.join(', ')}`
      );
    }

    return patchMusicalNotes(treeConfig, currentSystem);
  }, [selectedMusicalSystem, getCurrentMusicalSystem]);

  // Extract patched paths for use throughout the component
  const patchedPaths = patchedConfig.paths;

  const handleMusicalSystemChange = useCallback((systemKey: string) => {
    setSelectedMusicalSystem(systemKey);
  }, []);

  const getAvailableMusicalSystems = useCallback(() => {
    return Object.keys(musicalSystems);
  }, []);

  const getCurrentSystemInfo = useCallback(() => {
    const currentSystem = getCurrentMusicalSystem(selectedMusicalSystem);
    return {
      name: selectedMusicalSystem,
      system: currentSystem,
      isValid: currentSystem ? true : false
    };
  }, [selectedMusicalSystem, getCurrentMusicalSystem]);

  return {
    selectedMusicalSystem,
    patchedConfig,
    patchedPaths,
    handleMusicalSystemChange,
    getAvailableMusicalSystems,
    getCurrentSystemInfo
  };
};
