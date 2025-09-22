// Audio Error Boundary - Handles audio-related errors gracefully
// Provides fallback UI when audio context fails to initialize

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class AudioErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🎵 AudioErrorBoundary: Audio error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="audio-error-fallback">
          <div className="error-message">
            <h3>Audio System Unavailable</h3>
            <p>Audio features are currently unavailable. The visual experience will continue normally.</p>
            <details>
              <summary>Technical Details</summary>
              <pre>{this.state.error?.message}</pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AudioErrorBoundary;
