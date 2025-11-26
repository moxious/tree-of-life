import * as Tonal from '@tonaljs/tonal';
import { Note, World, Triad, TreeState, GeneratedSystem, GeneratedChord } from './types';
import { WORLDS, TREE_TRIAD_DEFS, SEPHIRAH_CHORDS, TRIAD_SLOTS, PATHS } from './constants';

// Helper to normalize notes for comparison
function normalize(note: Note): string {
    // Replace unicode sharps/flats with standard for tonaljs
    const standardNote = note.replace(/♯/g, '#').replace(/♭/g, 'b');
    return Tonal.Note.get(standardNote).chroma || standardNote;
}

function getTriadsForWorld(world: World): Triad[] {
  const triads: Triad[] = [];
  const keys = world.relatedKeys;
  
  keys.forEach(root => {
    // Normalize root for tonal
    const standardRoot = root.replace(/♯/g, '#').replace(/♭/g, 'b');
    
    // Major Triad
    triads.push({
      root,
      quality: 'Major',
      tones: [
          standardRoot, 
          Tonal.Note.transpose(standardRoot, "3M"), 
          Tonal.Note.transpose(standardRoot, "5P")
      ].map(n => Tonal.Note.simplify(n).replace(/#/g, '♯').replace(/b/g, '♭'))
    });
    // Relative Minor Triad (using 6th degree as root)
    const minorRootStandard = Tonal.Note.simplify(Tonal.Note.transpose(standardRoot, "6M"));
    const minorRoot = minorRootStandard.replace(/#/g, '♯').replace(/b/g, '♭');
    
    triads.push({
      root: minorRoot,
      quality: 'Minor',
      tones: [
          minorRootStandard, 
          Tonal.Note.transpose(minorRootStandard, "3m"), 
          Tonal.Note.transpose(minorRootStandard, "5P")
      ].map(n => Tonal.Note.simplify(n).replace(/#/g, '♯').replace(/b/g, '♭'))
    });
  });
  
  // Deduplicate by sorting tones
  const uniqueTriads: Triad[] = [];
  const seen = new Set<string>();
  
  triads.forEach(t => {
    const signature = t.tones.map(n => normalize(n)).sort().join('-');
    if (!seen.has(signature)) {
      seen.add(signature);
      uniqueTriads.push(t);
    }
  });
  
  return uniqueTriads;
}

function triadsEqual(t1: Triad, t2: Triad): boolean {
    const s1 = t1.tones.map(n => normalize(n)).sort().join('-');
    const s2 = t2.tones.map(n => normalize(n)).sort().join('-');
    return s1 === s2;
}

function getCircleOfFifthsNeighbors(triad: Triad, availableTriads: Triad[]): Triad[] {
    // Rough heuristic: share 2 notes, or root is P5/P4 away
    return availableTriads.filter(t => {
        if (triadsEqual(t, triad)) return false;
        // Check shared tones
        const t1Tones = new Set(triad.tones.map(n => normalize(n)));
        const shared = t.tones.filter(n => t1Tones.has(normalize(n)));
        if (shared.length >= 1) return true;
        
        // Check root relationship
        const tRootStd = triad.root.replace(/♯/g, '#').replace(/♭/g, 'b');
        const targetRootStd = t.root.replace(/♯/g, '#').replace(/♭/g, 'b');
        
        const int = Tonal.Interval.distance(tRootStd, targetRootStd);
        return ['4P', '5P', '3M', '3m', '-3M', '-3m'].includes(int);
    });
}

function shuffle<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
}

export function solve(worldName: string): GeneratedSystem {
  const world = WORLDS[worldName as keyof typeof WORLDS];
  if (!world) throw new Error(`Unknown world: ${worldName}`);

  const allTriads = getTriadsForWorld(world);
  let assignments: Record<number, Note> = {};
  let bestAssignments: Record<number, Note> | null = null;
  let bestSpiceScore = -Infinity;

  // Try multiple times to find a valid solution
  const MAX_ATTEMPTS = 2000;
  
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      try {
          assignments = {};
          const placedTriads: Triad[] = [];

          // 1. Phase 1: Skeleton Selection
          // A. Supernal Triad (Center Key typically)
          const supernalTriad = allTriads.find(t => t.root === world.centerKey && t.quality === 'Major') || allTriads[0];
          placedTriads.push(supernalTriad);
          
          // Assign to paths 11, 12, 14
          const supernalNotes = shuffle(supernalTriad.tones);
          assignments[11] = supernalNotes[0];
          assignments[12] = supernalNotes[1];
          assignments[14] = supernalNotes[2];

          // B. Ethical Triad (Reflection)
          const ethicalCandidates = getCircleOfFifthsNeighbors(supernalTriad, allTriads);
          const ethicalTriad = shuffle(ethicalCandidates)[0];
          placedTriads.push(ethicalTriad);

          // Assign to paths 19, 20, 22
          const ethicalNotes = shuffle(ethicalTriad.tones);
          assignments[19] = ethicalNotes[0];
          assignments[20] = ethicalNotes[1];
          assignments[22] = ethicalNotes[2];

          // C. Astral Triad (Reflection from Ethical)
          const astralCandidates = getCircleOfFifthsNeighbors(ethicalTriad, allTriads);
          const astralTriad = shuffle(astralCandidates)[0];
          placedTriads.push(astralTriad);

          // Assign to paths 27, 28, 30
          const astralNotes = shuffle(astralTriad.tones);
          assignments[27] = astralNotes[0];
          assignments[28] = astralNotes[1];
          assignments[30] = astralNotes[2];

          // 2. Phase 2: Bridge & Leaf Assignment
          // Identify missing triads
          const missingTriads = allTriads.filter(t => !placedTriads.some(pt => triadsEqual(pt, t)));
          
          // Identify Slots
          // Shuffle slots to try different positions
          const slots = shuffle(TRIAD_SLOTS);
          
          // Try to fit missing triads into slots
          // This is a mini-CSP
          for (const triad of missingTriads) {
              let placed = false;
              for (const slot of slots) {
                  // Check if slot is compatible with existing assignments
                  const slotPaths = slot.paths;
                  const currentAssigned = slotPaths.map(p => assignments[p]).filter(n => n !== undefined);
                  const triadTones = triad.tones.map(n => normalize(n));
                  
                  // Can we map the current assignments to this triad?
                  const compatible = currentAssigned.every(n => triadTones.includes(normalize(n)));
                  
                  if (compatible) {
                      // Check if we can fill the rest
                      // We need to assign the unassigned paths in this slot to the remaining notes of the triad
                      const unassignedPaths = slotPaths.filter(p => assignments[p] === undefined);
                      const assignedNotes = currentAssigned.map(n => normalize(n));
                      const remainingNotes = triad.tones.filter(n => !assignedNotes.includes(normalize(n)));
                      
                      if (unassignedPaths.length >= remainingNotes.length) {
                           // Assign remaining notes to first available paths
                           remainingNotes.forEach((note, idx) => {
                               assignments[unassignedPaths[idx]] = note;
                           });
                           
                           // If there are still unassigned paths in this slot (e.g. slot has 3 paths, triad has 3 notes, but we had duplicates?), 
                           // Just fill with random notes from the triad
                           const stillUnassigned = slotPaths.filter(p => assignments[p] === undefined);
                           stillUnassigned.forEach(p => {
                               assignments[p] = triad.tones[Math.floor(Math.random() * 3)];
                           });

                           placed = true;
                           break; // Move to next missing triad
                      }
                  }
              }
              if (!placed) {
                  throw new Error("Could not place all triads");
              }
          }

          // 3. Phase 3: Fill remaining paths
          // Ensure all 9 tones are used
          const usedTones = new Set(Object.values(assignments).map(n => normalize(n)));
          const unusedPalette = world.palette.filter(n => !usedTones.has(normalize(n)));
          
          const remainingPaths = PATHS.filter(p => assignments[p] === undefined);
          
          // Prioritize "Bridge" paths for unused tones if possible, or just fill randomly
          // We must use all unused tones
          if (remainingPaths.length < unusedPalette.length) {
             // This is rare but possible if we reused too many notes
             throw new Error("Not enough paths left to use all palette tones");
          }
          
          const tonesToAssign = shuffle([...unusedPalette]);
          
          // Fill remaining paths with required unused tones first, then random palette tones
          remainingPaths.forEach((p, i) => {
              if (i < tonesToAssign.length) {
                  assignments[p] = tonesToAssign[i];
              } else {
                  assignments[p] = world.palette[Math.floor(Math.random() * world.palette.length)];
              }
          });
          
          // 4. Final Verification
          // Check coverage
          const finalTriadsFound = new Set<string>();
          // Check all potential triad locations (every Sephirah Below/Above + Tree Triads)
          // Actually we just need to ensure that for every required triad, there exists SOME generated chord that matches it.
          // Let's generate all chords
          const generatedChords = generateChords(assignments);
          
          generatedChords.forEach(gc => {
             const chordName = gc.chord_name; // This might be "Cm", "Cmaj7" etc.
             // We need to check exact tone matches against required triads
             const gcTones = gc.chord_tones.map(n => normalize(n)).sort().join('-');
             
             allTriads.forEach(t => {
                 const tTones = t.tones.map(n => normalize(n)).sort().join('-');
                 if (gcTones === tTones) {
                     finalTriadsFound.add(tTones);
                 }
                 // Check if it contains the triad (e.g. triad + extra note)
                 // For "Complete Triad Coverage" we usually want the clean triad to exist somewhere.
                 // But strict containment is good.
                 // Let's relax to: if the row is exactly the triad.
             });
          });
          
          if (finalTriadsFound.size < 6) {
               throw new Error(`Missing triads: Found ${finalTriadsFound.size}/6`);
          }
          
          // If we got here, we have a valid system!
          // Calculate score (minimize unisons, maximize consonance)
          const score = calculateScore(generatedChords);
          
          if (score > bestSpiceScore) {
              bestSpiceScore = score;
              bestAssignments = { ...assignments };
          }
          
          // Optimization: if score is very good, stop early
          if (score > 0) break; 

      } catch (e) {
          // Continue to next attempt
      }
  }

  if (!bestAssignments) {
      throw new Error("Could not generate a valid system after max attempts");
  }

  return formatSystem(world, bestAssignments);
}

function generateChords(assignments: Record<number, Note>): GeneratedChord[] {
    const chords: GeneratedChord[] = [];
    
    // Helper for Tree Triads
    Object.values(TREE_TRIAD_DEFS).forEach(def => {
        const tones = def.pathNumbers.map(p => assignments[p]).filter(Boolean);
        const uniqueTones = Array.from(new Set(tones));
        // Convert to standard notation for Tonal detection
        const standardTones = uniqueTones.map(t => t.replace(/♯/g, '#').replace(/♭/g, 'b'));
        const detection = Tonal.Chord.detect(standardTones);
        chords.push({
            chord: def.name,
            path_numbers: def.pathNumbers,
            chord_tones: uniqueTones,
            chord_name: (detection[0] || uniqueTones[0] || "Unknown").replace(/#/g, '♯').replace(/b/g, '♭'),
            notes: detection.length > 0 ? detection.join(", ").replace(/#/g, '♯').replace(/b/g, '♭') : "No clear chord",
            spice: getSpice(standardTones) // Pass standard tones to getSpice
        });
    });

    // Helper for Sephirot
    SEPHIRAH_CHORDS.forEach(def => {
        const tones = def.pathNumbers.map(p => assignments[p]).filter(Boolean);
        const uniqueTones = Array.from(new Set(tones));
        // Convert to standard notation for Tonal detection
        const standardTones = uniqueTones.map(t => t.replace(/♯/g, '#').replace(/♭/g, 'b'));
        const detection = Tonal.Chord.detect(standardTones);
        chords.push({
            chord: def.name,
            path_numbers: def.pathNumbers,
            chord_tones: uniqueTones,
            chord_name: (detection[0] || uniqueTones[0] || "Unknown").replace(/#/g, '♯').replace(/b/g, '♭'),
            notes: detection.length > 0 ? detection.join(", ").replace(/#/g, '♯').replace(/b/g, '♭') : "No clear chord",
            spice: getSpice(standardTones) // Pass standard tones to getSpice
        });
    });

    return chords;
}

function getSpice(tones: string[]): string {
    if (tones.length === 0) return "N/A";
    if (tones.length === 1) return "😌"; // Unison is calm but boring? Plan says unison is "boring".
    // Let's prefer proper chords
    // Tones passed here are already standard notation if coming from generateChords
    const detection = Tonal.Chord.detect(tones);
    if (detection.length > 0) return "😌"; // Consonant
    return "🌶️"; // Dissonant/Unknown
}

function calculateScore(chords: GeneratedChord[]): number {
    let score = 0;
    chords.forEach(c => {
        if (c.chord_tones.length > 1) score += 10; // Diversity is good
        if (c.spice === "😌") score += 5;
        if (c.chord_tones.length === 1 && c.path_numbers.length > 1) score -= 5; // Boring unison
    });
    return score;
}

function formatSystem(world: World, assignments: Record<number, Note>): GeneratedSystem {
    const chords = generateChords(assignments);
    return {
        world: world.name.toLowerCase(),
        description: `Hybrid Generated System for ${world.name} with Complete Triad Coverage.`,
        references: [],
        system: `Gemini3-Hybrid_${world.name}_${new Date().toISOString().split('T')[0]}`,
        assignments: Object.fromEntries(Object.entries(assignments).map(([k, v]) => [k, v])),
        chords: chords
    };
}

