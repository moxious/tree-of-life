import { World, WorldName, Triad, SephirahChordDef } from './types';

export const ALL_PITCH_CLASSES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];

// Enharmonic normalization map (map everything to sharps for calculation, then display as needed)
// We will stick to a standard set for internal logic if needed, but typically we want to preserve input spelling if possible.
// For this solver, we will use the spellings defined in the palette.

export const WORLDS: Record<WorldName, World> = {
  Assiah: {
    name: 'Assiah',
    // Bb major, Eb major, Ab major
    // Bb: Bb, C, D, Eb, F, G, A
    // Eb: Eb, F, G, Ab, Bb, C, D
    // Ab: Ab, Bb, C, Db, Eb, F, G
    // Union: Bb, C, D, Eb, F, G, A, Ab, Db
    palette: ["B♭", "C", "D", "E♭", "F", "G", "A", "A♭", "D♭"],
    centerKey: "E♭",
    relatedKeys: ["B♭", "E♭", "A♭"]
  },
  Yetzirah: {
    name: 'Yetzirah',
    // F major, C major, G major
    // F: F, G, A, Bb, C, D, E
    // C: C, D, E, F, G, A, B
    // G: G, A, B, C, D, E, F#
    // Union: F, G, A, Bb, C, D, E, B, F#
    palette: ["F", "G", "A", "B♭", "C", "D", "E", "B", "F♯"],
    centerKey: "C",
    relatedKeys: ["F", "C", "G"]
  },
  Atziluth: {
    name: 'Atziluth',
    // D major, A major, E major
    // D: D, E, F#, G, A, B, C#
    // A: A, B, C#, D, E, F#, G#
    // E: E, F#, G#, A, B, C#, D#
    // Union: D, E, F#, G, A, B, C#, G#, D#
    palette: ["D", "E", "F♯", "G", "A", "B", "C♯", "G♯", "D♯"],
    centerKey: "A",
    relatedKeys: ["D", "A", "E"]
  },
  Briah: {
    name: 'Briah',
    // C# major, F# major, B major
    // C#: C#, D#, E#, F#, G#, A#, B# -> C#, D#, F, F#, G#, A#, C
    // F#: F#, G#, A#, B, C#, D#, E# -> F#, G#, A#, B, C#, D#, F
    // B: B, C#, D#, E, F#, G#, A#
    // Union: C#, D#, F, F#, G#, A#, C, B, E
    // Note: keeping consistent spelling with existing systems might be tricky, let's use sharp preference where possible or specific palette.
    // The document lists: C#, D#, E#, F#, G#, A#, B#, B, E
    // Let's normalize E#->F, B#->C for easier matching unless strictly requested otherwise.
    // Using spellings from existing JSON if possible.
    palette: ["C♯", "D♯", "F", "F♯", "G♯", "A♯", "C", "B", "E"],
    centerKey: "F♯",
    relatedKeys: ["C♯", "F♯", "B"]
  }
};

export const PATHS = [
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
  31, 32
];

export const TREE_TRIAD_DEFS: Record<string, SephirahChordDef> = {
  supernal: { name: "Supernal Tree-Triad", pathNumbers: [11, 12, 14] },
  ethical: { name: "Ethical Tree-Triad", pathNumbers: [19, 20, 22] },
  astral: { name: "Astral Tree-Triad", pathNumbers: [27, 28, 30] }
};

// Definitions of chords for each Sephirah (Above and Below)
// Note: Keter (Below) uses paths [11, 12, 13] per the incidence definition in spec section 2.2,
// which matches existing musicalSystems.json data. The spec section 2.6 has a typo listing path 14.
export const SEPHIRAH_CHORDS: SephirahChordDef[] = [
  { name: "Keter (Below)", pathNumbers: [11, 12, 13] },   // Keter-Hockmah, Keter-Binah, Keter-Tiferet
  { name: "Hockmah (Above)", pathNumbers: [11] },
  { name: "Hockmah (Below)", pathNumbers: [14, 15, 16] },
  { name: "Binah (Above)", pathNumbers: [12, 14] },
  { name: "Binah (Below)", pathNumbers: [17, 18] },
  { name: "Hesed (Above)", pathNumbers: [16] }, // Path 16 (Hockmah-Hesed) is the only path above Hesed

  { name: "Hesed (Below)", pathNumbers: [19, 20, 21] },
  { name: "Gevurah (Above)", pathNumbers: [17, 19] }, // 17 (3-5), 19 (4-5)
  { name: "Gevurah (Below)", pathNumbers: [22, 23] }, // 22 (5-6), 23 (5-8)
  { name: "Tiferet (Above)", pathNumbers: [13, 15, 18, 20, 22] }, // 1-6, 2-6, 3-6, 4-6, 5-6
  { name: "Tiferet (Below)", pathNumbers: [24, 25, 26] }, // 6-7, 6-8, 6-9
  { name: "Netzach (Above)", pathNumbers: [21, 24] }, // 4-7, 6-7
  { name: "Netzach (Below)", pathNumbers: [27, 28, 29] }, // 7-8, 7-9, 7-10
  { name: "Hod (Above)", pathNumbers: [23, 25, 27] }, // 5-8, 6-8, 7-8
  { name: "Hod (Below)", pathNumbers: [30, 31] }, // 8-9, 8-10
  { name: "Yesod (Above)", pathNumbers: [26, 28, 30] }, // 6-9, 7-9, 8-9
  { name: "Yesod (Below)", pathNumbers: [32] }, // 9-10
  { name: "Malkuth (Above)", pathNumbers: [29, 31, 32] } // 7-10, 8-10, 9-10
];

// Slots where triads can potentially form (beyond the 3 Tree-Triads which are anchors)
// Each slot has paths that could hold a complete triad
export interface TriadSlot {
  name: string;
  paths: number[];
}

export const TRIAD_SLOTS: TriadSlot[] = [
  { name: "Keter (Below)", paths: [11, 12, 13] },      // Overlaps Supernal (11,12)
  { name: "Hockmah (Below)", paths: [14, 15, 16] },   // Overlaps Supernal (14)
  { name: "Hesed (Below)", paths: [19, 20, 21] },     // Overlaps Ethical (19,20)
  { name: "Tiferet (Below)", paths: [24, 25, 26] },   // No overlap with Tree-Triads
  { name: "Netzach (Below)", paths: [27, 28, 29] },   // Overlaps Astral (27,28)
  { name: "Hod (Above)", paths: [23, 25, 27] },       // Overlaps Astral (27)
  { name: "Yesod (Above)", paths: [26, 28, 30] }      // Overlaps Astral (28,30)
];

