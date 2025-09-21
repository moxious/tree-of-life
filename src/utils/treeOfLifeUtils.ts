// Tree of Life utility functions
// Functional approach with pure functions for tree-related calculations

import type { PathData } from '../types/treeOfLife';

// Pure function to find all incident paths for a given sephirah
// An incident path is one where the sephirah appears as either "from" or "to"
export const findIncidentPaths = (
  sephirahName: string, 
  allPaths: PathData[]
): PathData[] => {
  return allPaths.filter(path => 
    path.from === sephirahName || path.to === sephirahName
  );
};

// Pure function to get path count for a sephirah
export const getIncidentPathCount = (
  sephirahName: string, 
  allPaths: PathData[]
): number => {
  return findIncidentPaths(sephirahName, allPaths).length;
};

// Pure function to get connected sephirot for a given sephirah
export const getConnectedSephirot = (
  sephirahName: string, 
  allPaths: PathData[]
): string[] => {
  return findIncidentPaths(sephirahName, allPaths)
    .map(path => path.from === sephirahName ? path.to : path.from);
};

// Pure function to check if two sephirot are directly connected
export const areSephirotConnected = (
  sephirah1: string,
  sephirah2: string,
  allPaths: PathData[]
): boolean => {
  return allPaths.some(path => 
    (path.from === sephirah1 && path.to === sephirah2) ||
    (path.from === sephirah2 && path.to === sephirah1)
  );
};

// Pure function to get all sephirot that are exactly N steps away
export const getSephirotAtDistance = (
  sephirahName: string,
  allPaths: PathData[],
  distance: number
): string[] => {
  if (distance === 0) return [sephirahName];
  if (distance === 1) return getConnectedSephirot(sephirahName, allPaths);
  
  // For distances > 1, we'd need a graph traversal algorithm
  // This is a simplified implementation for distance 2
  if (distance === 2) {
    const directConnections = getConnectedSephirot(sephirahName, allPaths);
    const secondLevelConnections = directConnections.flatMap(connectedSephirah =>
      getConnectedSephirot(connectedSephirah, allPaths)
    );
    
    // Remove duplicates and the original sephirah
    return [...new Set(secondLevelConnections)].filter(name => name !== sephirahName);
  }
  
  // For now, return empty array for distances > 2
  return [];
};

// Pure function to validate sephirah name exists in paths
export const isValidSephirahName = (
  sephirahName: string,
  allPaths: PathData[]
): boolean => {
  return allPaths.some(path => 
    path.from === sephirahName || path.to === sephirahName
  );
};

// Pure function to get all unique sephirot names from paths
export const getAllSephirotNames = (allPaths: PathData[]): string[] => {
  const sephirotSet = new Set<string>();
  allPaths.forEach(path => {
    sephirotSet.add(path.from);
    sephirotSet.add(path.to);
  });
  return Array.from(sephirotSet);
};
