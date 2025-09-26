# Design Document: Kabbalistic Tree of Life → Musical Path Mapping (Pitch-Class Chords)

## 0) Purpose

1. Define a method for assigning pitch classes to the 22 paths of the Kabbalistic Tree of Life, (connecting 10 sephirot). 
2. Derive and evaluating “Sephirah chords” from the incident paths of each sephirah. 

This document encodes the rules, constraints, naming, output format, and optimization procedures so that AI models and constraint-programming based approaches can generate novel musical systems over the tree of life.

## 1) Inputs & Data Model
### 1.1 Nodes (Sephirot)

We use the canonical ten, excluding Da’ath:

1. Keter
2. Hockmah
3. Binah
4. Hesed
5. Gevurah
6. Tiferet
7. Netzach
8. Hod
9. Yesod
10. Malkuth

Please note and consistently use the Hebrew transliteration spelling preferences.

### 1.2 Paths (Edges)

Paths are treated as undirected for chord incidence. We use the standard 22 paths (starting at the number 11),
presented in the following list of Path Number: A-B where A and B are the incident sephira.

* 11: Keter—Hockmah
* 12: Keter—Binah
* 13: Keter—Tiferet
* 14: Hockmah—Binah
* 15: Hockmah—Tiferet
* 16: Hockmah—Hesed
* 17: Binah—Gevurah
* 18: Binah—Tiferet
* 19: Hesed—Gevurah
* 20: Hesed—Tiferet
* 21: Hesed—Netzach
* 22: Gevurah—Tiferet
* 23: Gevurah—Hod
* 24: Tiferet—Netzach
* 25: Tiferet—Hod
* 26: Tiferet—Yesod
* 27: Netzach—Hod
* 28: Netzach—Yesod
* 29: Netzach—Malkuth
* 30: Hod—Yesod
* 31: Hod—Malkuth
* 32: Yesod—Malkuth

### 1.3 Pitch Classes

Work strictly in 12-TET pitch classes (no octaves):

{ C, C#, D, Eb, E, F, F#, G, Ab, A, Bb, B }

Enharmonic pairs are recognized in naming.
Enharmonic values that are normally expected for a key should be used. For example in the key of F, one would
normally refer to Bb and not C#.

### 1.4 Four Worlds Circle of Fifths Mapping

The circle of fifths can be divided into four quadrants, each corresponding to one of the four Kabbalistic worlds. Each world uses the **union of all tones** from its three major keys:

- **NORTH/Earth/Assiah**: Bb major, Eb major, Ab major
  - **9 distinct tones**: Bb, C, D, Eb, F, G, A, Ab, Db

- **EAST/Air/Yetzirah**: F major, C major, G major
  - **9 distinct tones**: F, G, A, Bb, C, D, E, B, F#

- **SOUTH/Fire/Atziluth**: D major, A major, E major
  - **9 distinct tones**: D, E, F#, G, A, B, C#, G#, D#

- **WEST/Water/Briah**: C# major, F# major, B major
  - **9 distinct tones**: C#, D#, E#, F#, G#, A#, B#, B, E

Each world provides 9 pitch classes (union of 3 major keys) for path assignments. World selection is implementation-specific and determines the available pitch palette. Because each world consists of 3 adjacent
keys on the circle of 5ths, they are in a sense all equal to one another. But the unique flavor or character
of each world's assignments may differ according to pitch distribution across paths, and the resulting 
chord combinations that produces.

## 2) Derived Chords: Above / Below / Tree-Triad

When looking at an individual sephira, we can say that it participates in a number of different chords,
depending on which of the incident paths we look at.  We will now describe what is meant by "above chords",
"below chords", and "tree-triad" chords.

### 2.1 Above Chords

For each sephirah S (with index n):

* **Above(S)** = all incident paths to sephirot with index < n. As an example, Keter at position 1 is "Above" Hockmah at position 2.  1 < 2. Yesod is "Above" Malkuth, 9 < 10

Keter (Above) has no chord, because Above(Keter) = ()

### 2.2 Below Chords

* **Below(S)** = all incident paths to sephirot with index > n.  As an example, Tiferet is 
"Below" Gevurah; Tiferet=6 > Gevurah=5.

Malkuth (Below) has no chord, because Below(Malkuth) = ()

### 2.3 Tree-Triad Chords

The Tree of Life contains three structural triangles, each forming a **tree-triad chord**:

* **Supernal Tree-Triad**: (Keter–Hockmah–Binah)
  - **Tree-triad chord**: The set of unique pitch classes on all paths connecting these three sephirot
  - **Paths involved**: 11, 12, 14 (Keter–Hockmah, Keter–Binah, Hockmah–Binah)
  - **Same chord for all three**: Keter, Hockmah, and Binah all share the same supernal tree-triad chord

* **Ethical Tree-Triad**: (Hesed–Gevurah–Tiferet)  
  - **Tree-triad chord**: The set of unique pitch classes on all paths connecting these three sephirot
  - **Paths involved**: 19, 20, 22 (Hesed–Gevurah, Hesed–Tiferet, Gevurah–Tiferet)
  - **Same chord for all three**: Hesed, Gevurah, and Tiferet all share the same ethical tree-triad chord

* **Astral Tree-Triad**: (Netzach–Hod–Yesod)
  - **Tree-triad chord**: The set of unique pitch classes on all paths connecting these three sephirot
  - **Paths involved**: 27, 28, 30 (Netzach–Hod, Netzach–Yesod, Hod–Yesod)
  - **Same chord for all three**: Netzach, Hod, and Yesod all share the same astral tree-triad chord

**Note**: Malkuth and Da'ath participate in no triangle and hence have no tree-triad chord.

The term "tree-triad chord" is chosen carefully, to distinguish these tree-structural chords (tree triads) 
from musical triads (any collection of 3 tones, such as major/minor chords).

### 2.4 Sephirah Chords

When used generically, the term Sephirah chord refers to S(row) the set of unique pitch classes 
on all incident paths in that row (after deduplication).

### 2.5 Enharmonics

Chord tones (aggregate): keep exact spellings used on the paths (e.g., D♯, G, A♯).

Chord name: may re-spell enharmonically to use conventional chord spelling (e.g., name as E♭ major and spell tones E♭, G, B♭).

Chord tones may be freely re-arranged if it makes more sense to present them in a particular order. For example,
(E, G, C) is a C major triad, which is easier to see if it's written as C, E, G.  The chord E, G, C would 
technically be considered the first inversion of a C major triad, but as we are dealing with tone classes and
not pitches, the concept of chord inversion does not apply here.

### 2.6. Constraint: Tones per Chord is Fixed

Based on the paths on the tree of life, the possible number of tones per chord is always fixed, due
to the fixed nature of the incident paths, and is provided here. 

* Supernal Triad: (Keter, Hockmah, Binah): 3 tones, paths 11, 12, 14
* Moral Triad:  (Hesed, Gevurah, Tiferet): 3 tones, paths 19, 20, 22
* Astral Triad: (Netzach, Hod, Yesod): 3 tones, paths 27, 28, 30

The following list gives the sephirah and number of tones, listing their incident paths by path number:

* Keter (Above): 0 tones, Paths: N/A
* Keter (Below): 3 tones, Paths: 11, 12, 14
* Hockmah (Above): 1 tone, Paths: 11
* Hockmah (Below): 3 tones, Paths: 14, 15, 16
* Binah (Above): 2 tones, Paths: 12, 14
* Binah (Below): 2 tones, Paths: 17, 18
* Hesed (Above): 1 tone, Paths: 16
* Hesed (Below): 3 tones, Paths: 19, 20, 21
* Gevurah (Above): 2 tones, Paths: 17, 19
* Gevurah (Below): 2 tones, Paths: 22, 23
* Tiferet (Above): 5 tones, Paths: 22, 18, 13, 15, 20
* Tiferet (Below): 3 tones, Paths: 24, 25, 26
* Netzach (Above): 2 tones, Paths: 21, 24
* Netzach (Below): 3 tones, Paths: 27, 28, 29
* Hod (Above): 3 tones, Paths: 23, 25, 27
* Hod (Below): 2 tones, Paths: 30, 31
* Yesod (Above): 3 tones, Paths: 26, 28, 30
* Yesod (Below): 1 tone, Paths: 32
* Malkuth (Above): 1 tone, Paths: 32
* Malkuth (Below): 0 tones, Paths: N/A

We can then note that the following chords are monads/single notes:
* Hockmah (Above)
* Hesed (Above)
* Yesod (Below)

The following chords are dyads:
* Binah (Above)
* Gevurah (Above)
* Gevurah (Below)
* Netzach (Above)
* Hod (Below)

The following chords are triads:
* Keter (Below)
* Hesed (Below)
* Tiferet (Below)
* Netzach (Below)
* Hod (Above)
* Yesod (Above)

And Tiferet (Above) is the single special chord with 5 total tones.

## 3) Chord Naming Rules (Pop/Jazz)

Given the deduped pitch set for a row:

Prefer conventional tertian chords; for the 4 worlds system of generation, extensions
that are diatonic to the world's three related keys are encouraged. This will help create
color while maintaining harmonic coherence.

* Major: R–M3–P5
* Minor: R–m3–P5
* Dominant7: R–M3–P5–m7
* Maj7 / Min7: add M7 / m7
* Sus: sus2 (R–2–P5) or sus4 (R–4–P5)
* Add: add2/add4/add6 on top of major/minor triads

When multiple roots fit, choose the root that yields the most conventional chord with the fewest alterations. If ties remain, pick the interpretation that’s most diatonic relative to nearby anchor triads (see §7).

For dyads:

If they are identical notes (unison), label as “X (tone)”.

If two distinct notes but you want to keep 😌, collapse by setting the two incident path notes equal (see §6.2). If not collapsed, label as Gsus2(no5), open 5th, etc., and score with 🌶️ (see §5).

Keep Chord tones (aggregate) distinct from Chord name to allow enharmonic naming while preserving assigned spellings.

## 5) Global Constraints & Objectives

### 5.1 Always-on Constraints

- Use the 22 paths and 10 sephirot listed above; paths are undirected
- Exclude Da'ath
- Build Above/Below rows as in §2; omit Keter(Above), Malkuth(Below)
- Include tree-triad chords
- Deduplicate pitch classes within a row when listing chord tones
- Work in 12-TET without octaves

### 5.2 Optimization Targets

**Primary objective:** For Four Worlds approach, ensure complete triad coverage (all 6 triads per world). For All-12 approach, minimize total pepper count and maximize 😌 rows across the table.

There are two distinct approaches to generating tone-to-path mappings, each with different constraint
strategies.

**A) Four Worlds Approach:**
- Choose one of the four worlds (Assiah, Yetzirah, Atziluth, Briah)
- Use only the 9 pitch classes from that world's key set (union of 3 major keys)
- Ensure that all 9 pitch classes are used
- Optional rule: unison chords are boring, try to avoid generating chords whose incident notes all match
and produce a unison.

**A.2) Complete Triad Coverage Constraint (Required):**
- Each world must contain exactly 6 clean major/minor triads using its 9-pitch palette
- The 6 triads must be: the center major triad + 5 additional triads from the world's key relationships
- **ALL 6 TRIADS MUST BE GENERATED** - before a system can be completed, the algorithm must verify that all 6 available triads from the world's 3 related keys have been formed
- If any of the 6 possible triads are missing, the mapping is considered invalid and must be regenerated
- Across all 4 worlds, all 24 possible major/minor triads must be represented exactly once
- This ensures comprehensive harmonic coverage while maintaining elemental coherence

Specifically not required: tone assignment to paths does not have to be transpositionally equivalent between
worlds. That is, the different worlds can form their triads in different parts of the tree as desired.

**A.3) Triad Generation Priority (Required):**
- **Generating all 6 triads takes precedence over maximizing consonance**
- Some color or spiciness per world is desirable to ensure complete triad coverage
- Focus on harmonic completeness rather than perfect consonance

**B) All-12 Coverage Approach ("Option C"):**
- Require that all 12 pitch classes appear somewhere in the 22 paths
- Require that at least 2 major and 2 minor triads occur in some chord row of the system
- Permit controlled add-color on designated hub rows (see §7.3) to weave in the remaining pcs without destabilizing neighbors

## 7) Design Strategies

### 7.1 World Selection (Four Worlds Approach)

Choose any one of the four worlds. Use the elemental association as an inspiration.

- **Assiah (Earth)**: Bb major, Eb major, Ab major
- **Yetzirah (Air)**: F major, C major, G major
- **Atziluth (Fire)**: D major, A major, E major
- **Briah (Water)**: C# major, F# major, B major

### 7.2 Triadic "Triangles" (Reflections)

The Tree contains three structural triangles often treated as "reflections":

- **Supernal**: (Keter–Hockmah–Binah)
- **Middle**: (Hesed–Gevurah–Tiferet)  
- **Lower**: (Netzach–Hod–Yesod)

**For Four Worlds Approach:**
This "reflection" can be handled in several ways:

For a given supernal triangle triad, the next triad down is either the relative minor, 
relative major, major to the left, or major to the right in the @circle-of-fifths.png.

**For All-12 Approach:**
- Use circle-of-fifths neighbors (e.g., E♭ → B♭ → F)
- Diatonic mediants (e.g., Dm → B♭ → Gm)
- Chromatic mediants / deceptive moves (e.g., I → iv in a related region)

### 7.3 Flexible Edge Assignment (Four Worlds Approach)

Each path edge belongs to two sephirot rows. For the Four Worlds approach with complete triad coverage:

- **Shared edges** can use any note that works for both neighboring triads (not just exact intersections)
- **Priority**: Choose notes that maintain both triads' harmonic integrity
- **Fallback**: If no shared note exists, choose the note that best supports the more important triad
- **Dyad rows**: Dissonance is preferred over boring unisons. Very tight dissonance (one half step, 
like diminished seconds) are to be avoided if possible.

### 7.4 Intersection-Aware Assignment (All-12 Approach)

Each path edge belongs to two sephirot rows. When two triad rows share an edge, assign that edge a note common to both triads. This preserves both rows as triads.

## 8) Algorithm (Step-by-Step)

Some parts of this algorithm are deliberately not specified to allow flexibility in choice;
provided that the constraints are respected, any assignment of choice is acceptable.

### 8.1 Build Structures

- Load the nodes and 22 paths (as in §1.2)
- Compute Above/Below for each sephirah (as in §2)
- Build edge_to_rows map: each path → which two rows it belongs to

### 8.2 Choose Approach

**A) Four Worlds Approach:**
- Select one of the four worlds (Assiah, Yetzirah, Atziluth, Briah)
- Respect all hard constraints mentioned in previous sections

**B) All-12 Coverage Approach:**
- Respect all hard constraints of the All-12 approach mentioned above.

#### 8.3A Four Worlds Assignment

1. First, list all 6 possible triads from the world's 9-tone palette
2. Assign one of the 6 triads to the Supernal Triangle
3. Use the "reflection" approach above to assign remaining 2 triangles (Moral, Astral)
4. Assign remaining paths with an eye towards maximizing the number of distinct intervals
represented across the entire scheme
5. Check your work: list and evaluate all critical constraints

#### 8.3B All-12 Coverage Assignment

1. Pick any 2 major triads; pick any 2 minor triads with no duplication. Free choice is given; because
all 12 tones must be represented somewhere, spread between the major and minor triads may allow more
area to be covered
2. Ensure those 4 triads are represented somewhere in the tree
3. Assign remaining edges, borrowing from tones not yet used
4. Check your work: list and evaluate all critical constraints

#### 8.4 Produce Results: Table and JSON

**Special note on chord naming**: In order to determine the name of a given chord, you can use the TonalJS dependency that we have to determine the name of the chord like this:

```
console.log(require('@tonaljs/tonal').Chord.detect(process.argv[2].split(/[,\s]+/).filter(n => n.trim()))[0] || 'No chord detected');
```

You must be careful though that TonalJS only understands # (sharp) and b (flat) as accidentals; notes such as C♯ (sharp sign) or B♭ (flat sign) will produce errors and need to be replaced with # and b.

**8.4.1 Generate Chord Table **
For each printed row, including tree-triad rows (omit Keter (Above), and Malkuth (Below)):

- Tree Chord (e.g. Keter (Below) or Supernal Triad)
- Incident path numbers (ascending)
- Chord tones (aggregate) (unique, keep original spellings)
- Chord name
- Notes (explain any ambiguity / add-color)

**8.4.2 Generate Musical System**

**Important**: when asked to produce a new musical system, always ask what its short name
should be, and be sure to know which system to use. 

This short name will become the JSON key for the musical system. If the name is
"Tuesday", then name the system by its family and name, for example `12Tone_Tuesday` or
`4Worlds_Tuesday`

In @musicalSystems.json, create a new entry, following the schema of what is already there. References may 
always be empty [].  Make sure to format table results into the musical system as well by including a key called
"table", whose values is an array of objects such as: 

```
"table": [
   { 
    "treeChord": "Supernal Triad", 
    "incidentPaths": [11, 12, 14], 
    "chordTones": ["C","E","G"], 
    "chordName": "CM", 
    "notes": "..."
  }
]
```

**8.4.3 Output Format (Markdown Table):**

Use this exact schema (two rows per sephirah except omitted ones, plus three tree-triad chords):

```
| Sephirah | Incident path numbers | Chord tones (aggregate) | Chord name | Notes | 
```

**Tree-Triad Chords (added at bottom of table):**
After all Above/Below chords, add three additional rows for the tree-triad chords:

- **Supernal Tree-Triad**: Sephirah = "Supernal Tree-Triad", paths = 11, 12, 14
- **Ethical Tree-Triad**: Sephirah = "Ethical Tree-Triad", paths = 19, 20, 22  
- **Astral Tree-Triad**: Sephirah = "Astral Tree-Triad", paths = 27, 28, 30

**Common Fields:**
- Chord tones (aggregate): comma-separated pitch classes (deduped)
- Chord name: pop/jazz symbol; enharmonic as needed
- Notes: short reasoning hints (e.g., "collapsed dyad 12=14", "hub adds supply Eb/Ab/C")
- Notes may include spiciness/consonance, such as: 😌, 🌈, 🌶️, 🌶️🌶️, or 🌶️🌶️🌶️

After the table, add constraint proof

**Constraints:**
- Constraint 1 description: proof of satisfaction
- Constraint 2 description: proof of satisfaction

## 9) Summary

The core idea is intersection-aware triad and interval assignment over the Tree's fixed topology, using Above/Below splits to define per-sephirah chords, plus tree-triad chords for the three structural triangles.

**The core idea is implemented via two distinct approaches:**

**Four Worlds Approach:** Choose one of the four Kabbalistic worlds and use only its 9-pitch harmonic palette (union of 3 major keys), with the center major triad anchoring the Supernal triangle and all 6 possible triads from the world's palette distributed across the tree, ensuring complete harmonic coverage while maintaining elemental coherence.  Choosing 3 closely related keys maximizes consonance, and provides some structure, at
the cost of constraining more tightly what can be assigned in the tree.

**All-12 Coverage Approach:** Use all 12 pitch classes, aiming at ensuring the presence of some conventional triads, while allowing much more dissonance and harmonic spread.