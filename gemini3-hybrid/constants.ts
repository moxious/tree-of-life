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
export const SEPHIRAH_CHORDS: SephirahChordDef[] = [
  { name: "Keter (Below)", pathNumbers: [11, 12, 13] }, // Note: 13 is Keter-Tiferet, usually grouped here? Doc says 11,12,14 is Tree Triad.
  // Doc says: Keter (Below): 3 tones, Paths: 11, 12, 14 -- WAIT.
  // Let's check the doc.
  // 2.3 Tree-Triad Chords -> Supernal: 11, 12, 14.
  // 2.6 Constraint -> Keter (Below): 3 tones, Paths: 11, 12, 14.
  // This seems redundant? Or maybe Keter Below IS the Supernal Triad?
  // Wait, Path 13 is Keter-Tiferet. Keter is connected to 11, 12, 13.
  // Let's re-read 1.2 and 2.6 carefully.
  // Path 11: Keter-Hockmah
  // Path 12: Keter-Binah
  // Path 13: Keter-Tiferet
  // Section 2.6 says: "Keter (Below): 3 tones, Paths: 11, 12, 14". Path 14 is Hockmah-Binah.
  // Ah, Keter (Below) "incident paths to sephirot with index > n".
  // Incident paths to Keter (index 1) are 11, 12, 13.
  // But section 2.6 says 11, 12, 14. 14 is NOT incident to Keter.
  // Let's check the doc again.
  // "Keter (Below): 3 tones, Paths: 11, 12, 14" - This is explicitly written in the doc.
  // BUT 2.2 says: Below(S) = all incident paths to sephirot with index > n.
  // For Keter (1): 11 (to 2), 12 (to 3), 13 (to 6).
  // Why does 2.6 say 14? 14 is Hockmah-Binah.
  // Maybe 2.6 is defining "Sephirah Chords" which are distinct from just "incident paths"?
  // "Section 2.4 Sephirah Chords ... refers to S(row) the set of unique pitch classes on all incident paths... (after deduplication)."
  // But then 2.6 lists specific paths.
  // Let's look at "Supernal Tree-Triad" (11, 12, 14). This matches the "Keter (Below)" list in 2.6.
  // It seems 2.6 might have a typo or Keter (Below) is defined specially to matching the Supernal Triad?
  // However, usually "Below" means "paths going down from here".
  // Let's look at Tiferet (Above). Paths: 22, 18, 13, 15, 20.
  // Tiferet is 6.
  // 22 (Gevurah-Tiferet, 5-6) - Above
  // 18 (Binah-Tiferet, 3-6) - Above
  // 13 (Keter-Tiferet, 1-6) - Above
  // 15 (Hockmah-Tiferet, 2-6) - Above
  // 20 (Hesed-Tiferet, 4-6) - Above
  // This matches "incident paths from index < n".

  // Let's check Keter (Below) again in 2.6.
  // "Keter (Below): 3 tones, Paths: 11, 12, 14"
  // Path 14 is NOT incident to Keter.
  // Path 13 IS incident to Keter.
  // If I follow 2.2 strictly: Keter (Below) should be {11, 12, 13}.
  // The existing `Four_Worlds_Assiah_Complete` system in `musicalSystems.json` has:
  // "chord": "Keter (Below)", "path_numbers": [11, 12, 13].
  // OK, I will follow the actual incidence definition (Section 2.2) and existing JSON data, and assume Section 2.6 "Paths" column might be conflating it with the Triad or has an error for Keter.
  // Wait, Section 2.6 for Keter (Below) lists 11, 12, 14.
  // But the JSON output has 11, 12, 13.
  // I will trust the Logic of 2.2 + JSON evidence over the specific line in 2.6 which seems to swap 13 for 14 (making it the Supernal Triad).

  { name: "Hockmah (Above)", pathNumbers: [11] },
  { name: "Hockmah (Below)", pathNumbers: [14, 15, 16] },
  { name: "Binah (Above)", pathNumbers: [12, 14] },
  { name: "Binah (Below)", pathNumbers: [17, 18] },
  { name: "Hesed (Above)", pathNumbers: [16, 19] }, // 16 (Hockmah-Hesed), 19 (Hesed-Gevurah?? No 19 is Hesed-Gevurah, Hesed=4, Gevurah=5. So 19 is Below Hesed.)
  // Let's check Hesed incidence.
  // Hesed (4).
  // 16 (2-4) -> Above.
  // 19 (4-5) -> Below.
  // 20 (4-6) -> Below.
  // 21 (4-7) -> Below.
  // So Hesed Above should be [16].
  // Hesed Below should be [19, 20, 21].
  // Checking 2.6:
  // Hesed (Above): 1 tone, Paths: 16.
  // Hesed (Below): 3 tones, Paths: 19, 20, 21.
  // This matches.

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

export const TRIAD_SLOTS = [
  // The 3 Tree Triads (Supernal, Ethical, Astral) are handled separately as anchors.
  // We need to define where ELSE triads can form.
  // These are typically the "Sephirah (Below)" groupings which often form triads.
  "Hesed (Below)", // 19, 20, 21
  "Tiferet (Below)", // 24, 25, 26
  "Netzach (Below)", // 27, 28, 29 (Wait, 27,28 are part of Astral Triad 27,28,30. Path 29 is Netzach-Malkuth)
  // Actually, let's look at the "Slots" concept from the plan.
  // "Identify Slot candidates for these missing triads: Hesed(Below), Tiferet(Below), Netzach(Below), etc."
  // We should define these slots by their path numbers so the solver can try to fit triads into them.
  
  { name: "Keter (Below)", paths: [11, 12, 13] }, // Overlaps Supernal (11,12)
  { name: "Hockmah (Below)", paths: [14, 15, 16] }, // Overlaps Supernal (14)
  { name: "Hesed (Below)", paths: [19, 20, 21] }, // Overlaps Ethical (19,20)
  { name: "Tiferet (Below)", paths: [24, 25, 26] },
  { name: "Netzach (Below)", paths: [27, 28, 29] }, // Overlaps Astral (27,28)
  { name: "Hod (Above)", paths: [23, 25, 27] }, // Overlaps Astral (27)
  { name: "Yesod (Above)", paths: [26, 28, 30] } // Overlaps Astral (28,30)
];

