# Technical Context - Tree of Life Application

## Technology Stack

### Frontend Framework
- **React 19.1.0**: Latest version with modern features and performance improvements
- **TypeScript 5.8.3**: Type safety and enhanced developer experience
- **React DOM 19.1.0**: DOM rendering and hydration

### Build Tools
- **Vite 6.3.5**: Fast build tool with Hot Module Replacement (HMR)
- **ESLint 9.25.0**: Code linting and quality assurance
- **TypeScript ESLint 8.30.1**: TypeScript-specific linting rules

### Development Dependencies
- **@vitejs/plugin-react 4.4.1**: React plugin for Vite
- **eslint-plugin-react-hooks 5.2.0**: React hooks linting rules
- **eslint-plugin-react-refresh 0.4.19**: React refresh linting
- **globals 16.0.0**: Global variable definitions for ESLint

## Development Setup

### Prerequisites
- **Node.js**: Version 14 or higher (recommended: LTS version)
- **npm**: Package manager (comes with Node.js)
- **Git**: Version control

### Installation
```bash
# Clone repository
git clone <repository-url>
cd tree-of-life

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts
- `npm run dev`: Start development server (http://localhost:5173)
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## Technical Constraints

### Browser Support
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (last 2 versions)
- **ES6+ Features**: Uses modern JavaScript features
- **CSS Grid/Flexbox**: Modern layout techniques
- **SVG Support**: Requires SVG support for tree visualization

### Performance Requirements
- **Load Time**: < 3 seconds on 3G connection
- **Interaction Response**: < 100ms for hover effects
- **Bundle Size**: Optimized for fast loading
- **Memory Usage**: Efficient rendering for complex SVG

### Accessibility Requirements
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: WCAG AA compliance
- **Focus Management**: Clear focus indicators

## Dependencies

### Production Dependencies
```json
{
  "react": "^19.1.0",
  "react-dom": "^19.1.0"
}
```

### Development Dependencies
```json
{
  "@eslint/js": "^9.25.0",
  "@types/react": "^19.1.2",
  "@types/react-dom": "^19.1.2",
  "@vitejs/plugin-react": "^4.4.1",
  "eslint": "^9.25.0",
  "eslint-plugin-react-hooks": "^5.2.0",
  "eslint-plugin-react-refresh": "^0.4.19",
  "globals": "^16.0.0",
  "typescript": "~5.8.3",
  "typescript-eslint": "^8.30.1",
  "vite": "^6.3.5"
}
```

## Build Configuration

### Vite Configuration
- **Base Path**: `/tree-of-life/` for GitHub Pages deployment
- **Asset Handling**: Automatic asset optimization
- **TypeScript**: Integrated TypeScript support
- **HMR**: Hot Module Replacement for development

### TypeScript Configuration
- **Target**: ES2020 for modern browser support
- **Module**: ES2020 for modern module system
- **JSX**: React JSX transform
- **Strict Mode**: Enabled for type safety

### ESLint Configuration
- **Base**: ESLint recommended rules
- **React**: React-specific linting rules
- **TypeScript**: TypeScript-specific rules
- **Hooks**: React hooks linting rules

## Deployment

### GitHub Pages
- **Repository**: GitHub repository with Pages enabled
- **Branch**: `main` branch for deployment
- **Build Command**: `npm run build`
- **Output Directory**: `dist/`
- **Base Path**: `/tree-of-life/`

### Build Process
1. **TypeScript Compilation**: `tsc -b` compiles TypeScript
2. **Vite Build**: `vite build` creates production bundle
3. **Asset Optimization**: Images and CSS are optimized
4. **Static Generation**: Creates static HTML, CSS, and JS files

## Tool Usage Patterns

### Development Workflow
1. **Code Changes**: Edit TypeScript/React files
2. **HMR**: Changes automatically reflected in browser
3. **Linting**: ESLint runs on file save
4. **Type Checking**: TypeScript compiler checks types
5. **Testing**: Manual testing in browser

### Git Workflow
1. **Feature Branches**: Create branches for new features
2. **Pull Requests**: Code review before merging
3. **Main Branch**: Production-ready code
4. **Deployment**: Automatic deployment on main branch

### Code Quality
- **TypeScript**: Compile-time type checking
- **ESLint**: Code style and best practices
- **Prettier**: Code formatting (if configured)
- **Manual Testing**: User experience validation

## Performance Considerations

### Bundle Optimization
- **Tree Shaking**: Unused code elimination
- **Code Splitting**: Dynamic imports for large features
- **Asset Optimization**: Image and CSS optimization
- **Minification**: JavaScript and CSS minification

### Runtime Performance
- **React Reconciliation**: Efficient DOM updates
- **SVG Optimization**: Minimal DOM manipulation
- **Event Handling**: Efficient event delegation
- **Memory Management**: Proper cleanup of event listeners

### Loading Performance
- **Static Assets**: Pre-loaded images and fonts
- **Lazy Loading**: Defer non-critical resources
- **Caching**: Browser caching for static assets
- **Compression**: Gzip compression for text assets

## Security Considerations

### Content Security
- **Static Content**: No dynamic content injection
- **No External APIs**: Self-contained application
- **Image Assets**: Local images only
- **No User Input**: No form submissions or user data

### Deployment Security
- **HTTPS**: Secure connection for GitHub Pages
- **No Secrets**: No API keys or sensitive data
- **Public Repository**: Open source code
- **Dependency Security**: Regular dependency updates

## Monitoring and Maintenance

### Error Tracking
- **Console Logging**: Development error logging
- **User Feedback**: Manual error reporting
- **Browser DevTools**: Development debugging

### Performance Monitoring
- **Lighthouse**: Performance auditing
- **Browser DevTools**: Performance profiling
- **User Experience**: Manual performance testing

### Maintenance Tasks
- **Dependency Updates**: Regular package updates
- **Security Patches**: Security vulnerability fixes
- **Browser Compatibility**: Testing on new browser versions
- **Performance Optimization**: Ongoing performance improvements
