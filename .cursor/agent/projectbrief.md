# Tree of Life Application - Project Brief

## Project Overview

The Tree of Life application is an interactive web-based visualization of the Kabbalistic Tree of Life (Etz Chaim), a fundamental symbol in Jewish mysticism and Western esotericism. The application allows users to explore the complex correspondences and relationships within this sacred diagram through an intuitive, modern interface.

## Core Features

### 1. Interactive Tree Visualization
- **SVG-based Tree**: Renders the traditional Tree of Life structure with 10 sephirot (spheres) connected by 22 paths
- **Two Visualization Modes**:
  - **Sphere Mode**: Traditional circular sephirot with hover effects and scaling
  - **Card Mode**: Rectangular tarot card representations that expand on hover
- **Interactive Elements**: Hover over sephirot or paths to see detailed information

### 2. Four Worlds System
The application implements the Kabbalistic concept of the Four Worlds (Olamot), each representing different levels of reality:
- **Atziluth (אצילות)**: Emanation - Pure divinity and emanation
- **Briah (בריאה)**: Creation - Pure intellect and creation  
- **Yetzirah (יצירה)**: Formation - Emotion and psychological formation
- **Assiah (עשיה)**: Action - The Material World, physical manifestation

### 3. Rich Correspondences
Each sephirah and path includes extensive mystical correspondences:
- **Hebrew Names & Letters**: Traditional Hebrew names and associated letters
- **Planetary Correspondences**: Astrological associations (Sun, Moon, planets, zodiac signs)
- **Elements**: Fire, Water, Air, Earth, Spirit
- **Colors**: Different colors for each world level
- **Tarot Cards**: Complete Rider-Waite-Smith tarot deck associations
- **Musical Notes**: Musical correspondences for each path
- **Gematria Values**: Numerical values of Hebrew letters

### 4. Visual Assets
- **Sephirah Images**: Custom images for each sephirah in all four worlds
- **Tarot Card Images**: Complete RWS tarot deck with cards for each path and sephirah
- **Interactive Hover Effects**: Smooth transitions and visual feedback

## Technical Implementation

### Technology Stack
- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite for fast development and building
- **Styling**: CSS with modern features (backdrop-filter, gradients, transitions)
- **Graphics**: SVG for scalable vector graphics
- **Deployment**: GitHub Pages (configured with base path `/tree-of-life/`)

### Key Components
- **TreeOfLife**: Main container component managing state and layout
- **Sephirah**: Individual sephirah rendering with hover detection
- **Path**: Path rendering between sephirot with Hebrew letter labels
- **WorldSelector**: Interface for switching between the four worlds
- **VisualizationPicker**: Toggle between sphere and card modes
- **InfoPanel**: Detailed information display for hovered elements
- **WorldInfo**: Header displaying current world information

### Data Structure
The application uses a comprehensive JSON configuration file (`treeOfLifeConfig.json`) containing:
- Complete sephirah definitions with positions, colors, and metadata
- All 22 paths with their correspondences
- World-specific image mappings
- Tarot card associations
- Styling configuration

## User Experience

### Navigation
1. **World Selection**: Choose between the four Kabbalistic worlds using the top control panel
2. **Visualization Mode**: Switch between traditional sphere view and tarot card view
3. **Interactive Exploration**: Hover over any sephirah or path to see detailed information
4. **Information Panel**: Right-side panel displays comprehensive correspondences

### Educational Value
The application serves as both a spiritual tool and educational resource, allowing users to:
- Learn the traditional structure of the Tree of Life
- Understand the complex system of correspondences
- Explore the relationships between different mystical traditions
- Study the visual representations of abstract concepts

## Target Audience
- Students of Kabbalah and Jewish mysticism
- Practitioners of Western esotericism and Hermeticism
- Tarot enthusiasts and divination practitioners
- Anyone interested in sacred geometry and mystical symbolism
- Educators teaching comparative religion or esoteric studies

## Unique Features
- **Dual Visualization Modes**: Traditional and tarot card representations
- **Complete Correspondence System**: Integrates multiple mystical traditions
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI/UX**: Clean, intuitive interface with smooth animations
- **Comprehensive Data**: Extensive metadata for each element of the tree
