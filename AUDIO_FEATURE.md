# Tree of Life Audio Feature

## Overview

The Tree of Life application now includes a sophisticated audio system that plays musical tones when paths are clicked. Each path's associated musical note is played across multiple octaves with configurable effects including reverb and chorus.

## Features

### Musical Tones
- **Multi-octave playback**: Each note plays across 3 octaves (C3, C4, C5) by default
- **Symmetric octave distribution**: Centered around middle C (C4)
- **Exponential decay**: Natural-sounding note fade-out
- **Overlapping sounds**: Multiple paths can play simultaneously

### Audio Effects
- **Sine wave synthesis**: Pure, soft tones
- **Reverb effect**: Spatial depth and resonance
- **Chorus effect**: Rich, thickened sound
- **Configurable parameters**: All effects can be adjusted

### User Experience
- **Click to play**: Audio triggers on path click (not hover)
- **No UI controls**: Keeps interface clean and simple
- **Browser compatibility**: Respects browser mute settings
- **No visual feedback**: Pure audio experience

## Technical Implementation

### Architecture
The audio system uses a functional programming approach with:

- **AudioService**: Singleton service managing Tone.js audio context
- **Pure functions**: All audio calculations are pure and testable
- **Immutable configuration**: Audio settings are immutable and type-safe
- **Component-based**: Audio logic is encapsulated in reusable components

### Key Components

#### AudioService.tsx
- Manages Tone.js audio context initialization
- Handles multi-octave tone generation
- Applies reverb and chorus effects
- Tracks active voices for cleanup

#### audioConfig.ts
- Defines AudioConfig interface with TypeScript
- Provides default configuration values
- Includes validation functions
- Supports configuration updates

#### musicalNotes.ts
- Maps note names to frequencies
- Calculates octave relationships
- Validates note name formats
- Pure functions for all calculations

### Configuration

The audio system is highly configurable through the `AudioConfig` interface defined in `src/types/audio.ts`:

```typescript
interface AudioConfig {
  octaves: number;           // Number of octaves to play (default: 6)
  baseOctave: number;        // Reference octave (default: 4)
  duration: number;          // Note duration in milliseconds (default: 2000)
  waveform: 'sine' | 'triangle' | 'sawtooth' | 'square';
  envelope: {
    attack: number;          // Attack time in seconds (default: 0.1)
    decay: number;           // Decay time in seconds (default: 0.2)
    sustain: number;         // Sustain level 0-1 (default: 0.5)
    release: number;         // Release time in seconds (default: 1.5)
  };
  gain: number;              // Master gain level 0-1 (default: 0.0)
  reverb: {
    enabled: boolean;
    roomSize: number;        // 0-1
    wet: number;             // 0-1
  };
  chorus: {
    enabled: boolean;
    frequency: number;       // Hz
    delayTime: number;       // ms
    depth: number;           // 0-1
  };
}
```

### Musical Note Mapping

The system supports all standard musical notes with sharps:
- **Natural notes**: C, D, E, F, G, A, B
- **Sharp notes**: C♯, D♯, F♯, G♯, A♯
- **Frequency calculation**: Based on A4 = 440Hz standard
- **Octave support**: Full range from C0 to B8

## Usage

### Basic Usage
1. Click on any path in the Tree of Life
2. The path's musical note will play across multiple octaves
3. Multiple paths can play simultaneously
4. Each note has exponential decay and effects

### Configuration
To modify audio behavior, update the `defaultAudioConfig` in `src/config/audioConfig.ts`:

```typescript
const defaultAudioConfig: AudioConfig = {
  octaves: 6,              // Change number of octaves
  baseOctave: 4,           // Change reference octave
  duration: 2000,          // Change note duration
  waveform: 'sine',        // Change waveform type
  envelope: {
    attack: 0.1,           // Adjust attack time
    decay: 0.2,            // Adjust decay time
    sustain: 0.5,          // Adjust sustain level
    release: 1.5           // Adjust release time
  },
  gain: 0.0,               // Adjust master gain level
  reverb: {
    enabled: true,         // Enable/disable reverb
    roomSize: 0.7,         // Adjust room size
    wet: 0.3               // Adjust reverb amount
  },
  chorus: {
    enabled: true,         // Enable/disable chorus
    frequency: 1.5,        // Adjust chorus frequency
    delayTime: 3.5,        // Adjust delay time
    depth: 0.7             // Adjust chorus depth
  }
};
```

## Browser Compatibility

The audio feature requires:
- **Modern browsers**: Chrome, Firefox, Safari, Edge (last 2 versions)
- **Web Audio API support**: Required for Tone.js
- **User interaction**: Audio context requires user gesture to start

## Performance Considerations

- **Lazy initialization**: Audio context starts only when needed
- **Voice management**: Automatic cleanup of finished notes
- **Memory efficiency**: Proper disposal of audio resources
- **Overlap handling**: Multiple simultaneous notes supported

## Testing

The audio system includes comprehensive tests:

```typescript
// Run tests in browser console
testMusicalNotes();
```

Tests cover:
- Frequency calculations
- Octave generation
- Note validation
- Configuration validation

## Future Enhancements

Potential improvements for the audio system:

1. **Additional waveforms**: Triangle, sawtooth, square waves
2. **More effects**: Delay, filter, distortion
3. **User controls**: Volume, effect toggles
4. **Preset configurations**: Different sound profiles
5. **Visual feedback**: Optional visual indicators
6. **MIDI support**: External MIDI device integration

## Troubleshooting

### Common Issues

1. **No sound on first click**: Browser requires user interaction to start audio
2. **Audio not working**: Check browser console for errors
3. **Poor performance**: Reduce number of octaves or disable effects
4. **Browser compatibility**: Ensure Web Audio API support

### Debug Mode

Enable debug logging by setting:
```typescript
// In AudioService.tsx
const DEBUG = true;
```

This will log audio events to the browser console.

## Dependencies

- **Tone.js**: Web audio synthesis library
- **React**: Component framework
- **TypeScript**: Type safety and development experience

## License

The audio feature is part of the Tree of Life application and follows the same license terms.
