// Tree of Life Application Types

export interface SephirahMetadata {
  hebrewName: string;
  englishName: string;
  planetaryCorrespondence: string;
  planetarySymbol: string;
  element: string;
}

export interface WorldColors {
  assiah: { color: string };
  yetzirah: { color: string };
  briah: { color: string };
  atziluth: { color: string };
}

export interface SephirahData {
  name: string;
  metadata: SephirahMetadata;
  worldColors: WorldColors;
}

export interface PathMetadata {
  pathNumber: number;
  hebrewLetter: string;
  hebrewLetterName: string;
  tarotCard: string;
  tarotNumber: number;
  tarotImage: string | null;
  astrologicalSign: string;
  astrologicalSymbol: string;
  element: string;
  elementSymbol: string;
  letterMeaning: string;
  musicalNote: string;
  gematriaValue: number;
}

export interface PathData extends PathMetadata {}

// Pinned state types
export interface PinnedState {
  sephirah: SephirahData | null;
  path: PathData | null;
  isSephirahPinned: boolean;
  isPathPinned: boolean;
}

// Hover state types
export interface HoverState {
  sephirah: SephirahData | null;
  path: PathData | null;
  activeHoveredSephirah: string | null;
}
