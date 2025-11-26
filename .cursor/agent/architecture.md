# Architecture - Tree of Life Application

## High-Level Overview

A React application that visualizes the Kabbalistic Tree of Life with interactive audio capabilities. The app renders sephirot (spheres) and paths (connections) as an SVG, allowing users to explore correspondences and play musical notes/chords.

```
┌─────────────────────────────────────────┐
│         App.tsx (Root)                  │
│         └── TreeOfLife.tsx              │
│             ├── Controls (World/Mode)   │
│             ├── SVG Canvas              │
│             │   ├── Path.tsx            │
│             │   └── Sephirah.tsx        │
│             └── InfoPanel.tsx           │
├─────────────────────────────────────────┤
│         State Management                │
│         ├── useTreeState (UI state)     │
│         └── AudioContext (Audio state)  │
├─────────────────────────────────────────┤
│         Services                        │
│         └── AudioService (Tone.js)       │
└─────────────────────────────────────────┘
```

## Core Components

### App.tsx
Simple root component that renders `TreeOfLife`.

### TreeOfLife.tsx
Main container component that:
- Manages layout and component composition
- Renders SVG canvas with sephirot and paths
- Coordinates between controls and visualization
- Wraps everything in `AudioProvider` and `AudioErrorBoundary`

### Visualization Components

**Sephirah.tsx** - Renders individual sephirot (spheres/cards)
- Supports sphere and card view modes
- Handles hover/click interactions
- Uses SVG patterns for images
- Supports multi-touch for chord playing

**Path.tsx** - Renders connections between sephirot
- Displays Hebrew letter labels
- Highlights paths when chords are played
- Supports edit mode for custom musical notes
- Detects Lightning Flash paths for special styling

**InfoPanel.tsx** - Displays information about hovered/pinned elements
- Shows sephirah metadata (Hebrew name, planetary correspondence, etc.)
- Shows path metadata (tarot card, astrological sign, musical note, etc.)
- Supports pinning for persistent display

### Control Components

**CombinedPicker** - Combined world and view mode selector
**MusicSystemPicker** - Selects musical note assignment system
**SynthPicker** - Selects synthesizer preset
**NowPlaying** - Displays currently playing notes/chords

## State Management

### useTreeState Hook
Centralized hook managing all tree-related state:

- **UI State**: `selectedWorld`, `viewMode`, `chordType`
- **Hover State**: Currently hovered sephirah/path
- **Pinned State**: Pinned sephirah/path for persistent display
- **Highlighting**: Paths highlighted when chords are played
- **Musical State**: Selected musical system, patched paths, edit mode, custom notes

State flows unidirectionally: components receive state as props and call action handlers to update state.

### AudioContext
React Context managing audio state and actions:

- **State**: Initialization status, sound enabled, now playing list, current preset
- **Actions**: `playNote()`, `playChord()`, `setSoundEnabled()`, `setPreset()`

Audio initialization happens on first user interaction (required for iOS compatibility).

## Audio System

### Architecture
```
AudioContext (React Context)
    ↓
AudioService (Pure class, no React)
    ↓
Synthesizer (Factory functions)
    ↓
Tone.js (Audio library)
```

### AudioService
Pure service class that:
- Manages Tone.js audio context initialization
- Creates and manages synth voices
- Handles voice lifecycle (creation, cleanup)
- Applies effects chains (reverb, chorus, limiter)
- Supports multiple synth presets (oscillator, FM, layered)

### Synthesizer Module
Factory functions for creating:
- **SynthVoice**: Basic oscillator + envelope + gain
- **PolymorphicVoice**: Supports multiple engine types (oscillator, FM, layered)
- **EffectsChain**: Chorus → Reverb → Gain → Limiter

### Features
- **Multi-octave notes**: Plays notes across multiple octaves simultaneously
- **Chord voicing**: Distributes chord notes across octaves for better sound
- **Dynamic gain**: Reduces master gain as more voices play (prevents clipping)
- **Device optimization**: Lower voice limits and gain for iOS devices
- **Preset system**: Configurable synth engines with effects

## Data Flow

### User Interaction Flow
1. User clicks/hovers sephirah or path
2. Component calls action handler from `useTreeState`
3. State updates in `useTreeState` hook
4. Components re-render with new props
5. If audio action needed, `useTreeState` calls `AudioContext` action

### Musical System Flow
1. User selects musical system from `musicalSystems.json`
2. `useTreeState` patches `treeOfLifeConfig.json` paths with new notes
3. Patched paths flow to `Path` components
4. Clicking sephirah finds paths above/below/triad
5. Extracts musical notes and plays chord via `AudioContext`

### Audio Playback Flow
1. Component calls `audioActions.playChord(notes, source)`
2. `AudioContext` adds entry to "now playing" list
3. `AudioService` creates voices using current preset
4. Voices play through effects chain
5. Voices auto-cleanup after duration

## Key Patterns

### Functional Programming
- Pure utility functions for tree calculations (`treeOfLifeUtils.ts`)
- Factory functions for creating audio components
- Immutable state updates
- Minimal side effects isolated to services

### Component Composition
- Small, focused components with single responsibilities
- Props-based communication
- Clear separation of presentation and logic

### State Management
- Custom hooks for domain-specific state (`useTreeState`)
- React Context for cross-cutting concerns (`AudioContext`)
- No external state management library

### Error Handling
- `AudioErrorBoundary` wraps audio components
- Graceful degradation when audio fails
- Error state displayed in UI

## Data Sources

- **treeOfLifeConfig.json**: Complete Kabbalistic data (sephirot, paths, correspondences)
- **musicalSystems.json**: Musical note assignment systems
- **synthPresets.ts**: Synthesizer preset configurations
- **Image assets**: Sephirah images and tarot cards in `public/images/`

## File Structure

```
src/
├── components/          # React components
│   ├── TreeOfLife.tsx  # Main container
│   ├── Sephirah.tsx    # Sephirah rendering
│   ├── Path.tsx         # Path rendering
│   └── ...
├── hooks/              # Custom React hooks
│   └── useTreeState.ts # Centralized state management
├── contexts/           # React contexts
│   └── AudioContext.tsx # Audio state management
├── services/           # Pure service classes
│   ├── AudioService.ts # Audio playback service
│   └── Synthesizer.ts  # Synth factory functions
├── utils/              # Utility functions
│   └── treeOfLifeUtils.ts # Tree calculations
├── types/              # TypeScript type definitions
└── config/             # Configuration files
```

## Build & Deployment

- **Development**: Vite dev server with HMR
- **Production**: Static build deployed to GitHub Pages
- **TypeScript**: Full type safety throughout
- **Dependencies**: React, Tone.js, @tonaljs/tonal
