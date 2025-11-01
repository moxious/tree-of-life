# Musical Note Editing Feature - Design Document

## Feature Overview

The Musical Note Editing feature allows users to dynamically edit the musical note assigned to each path on the Tree of Life. This feature enables users to create custom musical systems by modifying individual path tones, which immediately affects the audio playback and chord detection systems. The feature operates in an "edit mode" that can be toggled on/off, with all changes persisting only for the current session.

## User Stories

### Primary User Stories
1. **As a user**, I want to toggle edit mode on/off so that I can choose between viewing the tree normally or editing musical notes
2. **As a user**, I want to see dropdown menus on each path when in edit mode so that I can change the musical note for that path
3. **As a user**, I want to select from all 12 chromatic notes (including enharmonic equivalents) so that I have complete musical flexibility
4. **As a user**, I want to see the current note selected in each dropdown so that I know what note is currently assigned
5. **As a user**, I want my custom notes to immediately affect chord playback so that I can hear the results of my changes
6. **As a user**, I want to see the complete musical system JSON in the console so that I can save interesting configurations

### Secondary User Stories
7. **As a user**, I want to switch between musical systems so that I can start from different base configurations
8. **As a user**, I want my custom edits to be lost when switching systems so that I don't have conflicting states
9. **As a user**, I want the interface to work on mobile devices so that I can edit notes on any device

## Technical Architecture

### State Management Integration
The feature integrates with the existing unified state management system through the `useTreeState` hook:

```typescript
interface TreeState {
  // ... existing state
  musical: {
    selectedSystem: string;
    patchedPaths: PathData[];
    editMode: boolean;           // NEW: Toggle for edit mode
    customNotes: Record<number, string>; // NEW: Path number -> note mapping
  };
}
```

### Component Architecture
```
Path.tsx (Enhanced)
├── PathNoteEditor.tsx (NEW) - Dropdown component for note selection
└── Existing path rendering logic (conditional based on edit mode)
```

### Data Flow
1. **Edit Mode Toggle**: MusicSystemPicker component gains edit mode toggle
2. **Note Selection**: PathNoteEditor component handles note selection
3. **State Update**: Custom notes stored in `musical.customNotes`
4. **Path Patching**: `patchMusicalNotes` function enhanced to merge custom notes
5. **Console Output**: JSON generation on each note change

## UI/UX Design

### Edit Mode Toggle
- **Location**: MusicSystemPicker component
- **Control**: Checkbox or toggle switch labeled "Edit Mode"
- **Behavior**: When enabled, shows dropdowns; when disabled, shows Hebrew letters

### Path Note Editor
- **Replacement**: Hebrew letter text element
- **Component**: Native HTML `<select>` element
- **Positioning**: Same coordinates as Hebrew letter (midX + offsetX, midY + offsetY)
- **Styling**: Small, unobtrusive dropdown matching path styling
- **Options**: All 12 chromatic notes with proper symbols (♯, ♭)

### Visual States
- **Normal Mode**: Hebrew letters displayed as currently
- **Edit Mode**: Dropdown menus replace Hebrew letters
- **Hover States**: Dropdowns respond to hover like other interactive elements
- **Selection States**: Current note pre-selected in dropdown

## Data Flow

### Note Selection Process
1. User toggles edit mode ON
2. Hebrew letters replaced with dropdown menus
3. User selects new note from dropdown
4. Custom note stored in state: `customNotes[pathNumber] = selectedNote`
5. Path data updated with new note
6. Console outputs complete musical system JSON
7. Audio system uses updated note for playback

### Musical System Switching
1. User selects different musical system
2. `customNotes` cleared (edits lost)
3. System switches to selected configuration
4. All paths revert to system-assigned notes

### Console Output Format
```json
{
  "Custom_System_Timestamp_1234567890": {
    "description": "Custom musical system created by user",
    "references": [],
    "system": "Custom System - [Original System Name] - [Timestamp]",
    "assignments": {
      "11": "C",
      "12": "D♯",
      // ... all 22 paths
      "32": "F"
    }
  }
}
```

## Implementation Plan

### Phase 1: Core Infrastructure
1. **State Management Updates**
   - Add `editMode` and `customNotes` to TreeState interface
   - Add actions for toggling edit mode and updating custom notes
   - Update `useTreeState` hook with new state and actions

2. **PathNoteEditor Component**
   - Create new component for note selection dropdown
   - Implement proper note options with ♯ and ♭ symbols
   - Handle note selection and state updates

### Phase 2: Path Integration
3. **Path Component Updates**
   - Add conditional rendering for edit mode
   - Integrate PathNoteEditor component
   - Maintain existing hover and click behaviors

4. **Musical System Integration**
   - Update `patchMusicalNotes` to merge custom notes
   - Ensure custom notes override system notes
   - Maintain chord detection functionality

### Phase 3: UI Integration
5. **MusicSystemPicker Updates**
   - Add edit mode toggle control
   - Update component interface and styling
   - Ensure proper state synchronization

6. **Console Output System**
   - Implement JSON generation for custom systems
   - Format output to match musicalSystems.json structure
   - Include all 22 paths in output

### Phase 4: Testing and Refinement
7. **Cross-browser Testing**
   - Test dropdown functionality across browsers
   - Ensure mobile touch events work properly
   - Verify SVG positioning accuracy

8. **Integration Testing**
   - Test edit mode toggle behavior
   - Verify musical system switching
   - Confirm audio playback with custom notes

## Constraints and Assumptions

### Technical Constraints
- **SVG Positioning**: Dropdowns must be positioned using SVG coordinate system
- **Mobile Compatibility**: Touch events must work on mobile devices
- **Performance**: No impact on existing hover/click performance
- **State Consistency**: Custom notes must integrate seamlessly with existing state

### Design Constraints
- **Visual Consistency**: Dropdowns must not disrupt tree aesthetics
- **Accessibility**: Dropdowns must be accessible to screen readers
- **Responsive Design**: Must work on all screen sizes
- **Cultural Sensitivity**: Must maintain respect for Hebrew letter display

### Functional Constraints
- **Session Persistence**: Custom notes lost on page refresh
- **System Switching**: Custom notes lost when switching musical systems
- **No Validation**: No duplicate note prevention (future enhancement)
- **No Undo**: No undo/redo functionality

## Future Enhancements

### Short-term (Next Release)
- **Note Validation**: Prevent duplicate notes across paths
- **Undo/Redo**: Add undo/redo functionality for note changes
- **Keyboard Navigation**: Full keyboard support for dropdowns

### Medium-term (Future Releases)
- **Save Systems**: Allow saving custom systems with names
- **Import/Export**: Import/export custom musical systems
- **Note History**: Track note change history
- **Musical Analysis**: Show harmonic analysis of custom systems

### Long-term (Future Vision)
- **Collaborative Editing**: Multiple users editing simultaneously
- **System Sharing**: Share custom systems with other users
- **Advanced Validation**: Musical coherence validation
- **Visual Feedback**: Color coding for harmonic relationships

## Success Criteria

### Functional Success
- ✅ Edit mode toggle works correctly
- ✅ Dropdowns appear/disappear based on edit mode
- ✅ Note selection updates path data immediately
- ✅ Custom notes affect audio playback
- ✅ Console outputs proper JSON format
- ✅ Musical system switching clears custom notes

### User Experience Success
- ✅ Intuitive edit mode toggle
- ✅ Clear visual indication of editable paths
- ✅ Smooth interaction with dropdowns
- ✅ No disruption to existing functionality
- ✅ Works on mobile devices

### Technical Success
- ✅ No performance degradation
- ✅ Clean integration with existing code
- ✅ Proper TypeScript typing
- ✅ Maintains existing state management patterns
- ✅ Cross-browser compatibility

## Risk Mitigation

### Technical Risks
- **SVG Positioning Complexity**: Use existing Hebrew letter positioning logic
- **State Management Conflicts**: Leverage existing unified state patterns
- **Mobile Touch Issues**: Use standard HTML select element
- **Performance Impact**: Minimize re-renders with proper memoization

### User Experience Risks
- **Visual Disruption**: Maintain consistent styling with existing elements
- **Confusion About Edit Mode**: Clear labeling and visual feedback
- **Lost Work**: Clear indication that edits are session-only
- **Mobile Usability**: Test thoroughly on various devices

This design document provides a comprehensive roadmap for implementing the musical note editing feature while maintaining the application's existing functionality and user experience.
