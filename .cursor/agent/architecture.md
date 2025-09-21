# Architecture - Tree of Life Application

## High-Level Architecture

The Tree of Life application follows a modern React component-based architecture with a clear separation of concerns and unidirectional data flow.

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│  App.tsx (Root Component)                                  │
│  └── TreeOfLife.tsx (Main Container)                       │
│      ├── WorldInfo.tsx (Header Display)                    │
│      ├── WorldSelector.tsx (World Switching)               │
│      ├── VisualizationPicker.tsx (Mode Toggle)             │
│      ├── SVG Canvas (Tree Visualization)                   │
│      │   ├── Path.tsx (Path Rendering)                     │
│      │   └── Sephirah.tsx (Sephirah Rendering)             │
│      └── InfoPanel.tsx (Information Display)               │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                               │
├─────────────────────────────────────────────────────────────┤
│  treeOfLifeConfig.json (Static Configuration)              │
│  └── Complete Kabbalistic Data Structure                   │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy & Responsibilities

### 1. App.tsx (Root Component)
- **Purpose**: Application entry point and basic layout wrapper
- **Responsibilities**: 
  - Renders the main TreeOfLife component
  - Applies global CSS styles
- **State**: None (stateless)

### 2. TreeOfLife.tsx (Main Container)
- **Purpose**: Central state management and layout coordination
- **Responsibilities**:
  - Manages all application state (selected world, view mode, hover states)
  - Coordinates between child components
  - Handles user interactions and state updates
  - Renders the main SVG canvas
- **State Management**:
  - `selectedWorld`: Current Kabbalistic world (atziluth, briah, yetzirah, assiah)
  - `viewMode`: Visualization mode (sphere, card)
  - `hoveredSephirah`: Currently hovered sephirah data
  - `hoveredPath`: Currently hovered path data
  - `activeHoveredSephirah`: Prevents multiple simultaneous hovers

### 3. Control Components

#### WorldSelector.tsx
- **Purpose**: Interface for switching between the four Kabbalistic worlds
- **Props**: `selectedWorld`, `onWorldChange`, `worlds`
- **Behavior**: Renders buttons for each world with Hebrew and English names

#### VisualizationPicker.tsx
- **Purpose**: Toggle between sphere and card visualization modes
- **Props**: `viewMode`, `onViewModeChange`
- **Behavior**: Simple two-button interface for mode selection

#### WorldInfo.tsx
- **Purpose**: Displays information about the currently selected world
- **Props**: `world` (world metadata)
- **Behavior**: Shows Hebrew name, English name, and description

### 4. Visualization Components

#### Sephirah.tsx (Individual Sephirah)
- **Purpose**: Renders individual sephirot with interactive hover effects
- **Props**: Position, color, image, metadata, world colors, event handlers
- **Key Features**:
  - **Dual Rendering Modes**: Different behavior for sphere vs card mode
  - **Complex Hover Logic**: Prevents flickering with transition states
  - **Image Patterns**: SVG patterns for sephirah images
  - **Hover Detection**: Separate elements for hover detection vs visual display

#### Path.tsx (Path Between Sephirot)
- **Purpose**: Renders connections between sephirot with Hebrew letter labels
- **Props**: Start/end positions, stroke properties, path metadata
- **Key Features**:
  - **Lightning Flash Detection**: Special styling for the central path
  - **Label Positioning**: Calculates perpendicular offset for Hebrew letters
  - **Interactive Hover**: Shows path correspondences on hover

### 5. Information Display

#### InfoPanel.tsx
- **Purpose**: Displays detailed information about hovered elements
- **Props**: `sephirah`, `pathData`, `selectedWorld`
- **Behavior**:
  - Shows sephirah information when a sephirah is hovered
  - Shows path information when a path is hovered
  - Displays default message when nothing is hovered
  - Includes tarot card images for paths

## Data Flow Architecture

### State Management Pattern
The application uses a "lifted state" pattern where all state is managed in the `TreeOfLife` component and passed down to children:

```
TreeOfLife (State Owner)
├── selectedWorld → WorldSelector, WorldInfo, InfoPanel
├── viewMode → VisualizationPicker, Sephirah
├── hoveredSephirah → InfoPanel
└── hoveredPath → InfoPanel
```

### Event Handling Flow
1. **User Interaction** → Child Component
2. **Event Handler** → Child Component calls parent callback
3. **State Update** → TreeOfLife updates state
4. **Re-render** → All affected components re-render with new props

### Data Source
- **Static Configuration**: All Kabbalistic data stored in `treeOfLifeConfig.json`
- **No External APIs**: Application is completely self-contained
- **Image Assets**: Local images for sephirot and tarot cards

## Key Architectural Patterns

### 1. Component Composition
- Small, focused components with single responsibilities
- Props-based communication between components
- Clear separation between presentation and logic

### 2. State Management
- Centralized state in main container component
- Unidirectional data flow (props down, events up)
- No external state management library (Redux, Zustand, etc.)

### 3. Event Handling
- Callback props for child-to-parent communication
- Event delegation for complex hover interactions
- State-based conditional rendering

### 4. SVG Rendering Strategy
- **Layered Rendering**: Paths rendered first (behind), sephirot on top
- **Pattern-based Images**: SVG patterns for image display
- **Interactive Elements**: Separate hover detection elements from visual elements

## Technical Implementation Details

### Hover Interaction System
The application implements a sophisticated hover system to prevent conflicts:

1. **Sephirah Hover**: Only one sephirah can be hovered at a time
2. **Path Hover**: Clears sephirah hover when path is hovered
3. **Transition States**: Prevents flickering during mode changes
4. **Card Mode**: Special hover detection with rectangular areas

### Responsive Design
- **CSS Grid/Flexbox**: Modern layout techniques
- **Media Queries**: Responsive breakpoints for different screen sizes
- **SVG Scaling**: Vector graphics scale smoothly
- **Mobile Optimization**: Touch-friendly interface elements

### Performance Considerations
- **Static Data**: No API calls or dynamic data loading
- **Efficient Re-renders**: React's reconciliation optimizes updates
- **SVG Optimization**: Minimal DOM manipulation
- **Image Optimization**: Pre-loaded images with proper sizing

## File Structure

```
src/
├── App.tsx                 # Root component
├── App.css                 # Global styles
├── main.tsx               # Application entry point
├── index.css              # Base styles
├── treeOfLifeConfig.json  # Data configuration
└── components/
    ├── TreeOfLife.tsx     # Main container
    ├── Sephirah.tsx       # Individual sephirah
    ├── Path.tsx           # Path rendering
    ├── WorldSelector.tsx  # World switching
    ├── VisualizationPicker.tsx # Mode toggle
    ├── InfoPanel.tsx      # Information display
    └── WorldInfo.tsx      # World header
```

## Build & Deployment

### Development
- **Vite**: Fast development server with HMR
- **TypeScript**: Type safety and better development experience
- **ESLint**: Code quality and consistency

### Production
- **Static Build**: Generates static files for deployment
- **GitHub Pages**: Deployed to `/tree-of-life/` subdirectory
- **Asset Optimization**: Vite handles bundling and optimization

## Scalability Considerations

### Current Limitations
- **Static Data**: All data is hardcoded in JSON
- **No Persistence**: No user preferences or state persistence
- **Single Language**: Only English/Hebrew support

### Potential Extensions
- **Dynamic Data**: API integration for additional correspondences
- **User Preferences**: Save favorite worlds or visualization modes
- **Internationalization**: Multi-language support
- **Advanced Visualizations**: 3D rendering or additional view modes
- **Educational Features**: Guided tours or interactive lessons
