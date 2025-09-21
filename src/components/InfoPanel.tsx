import React from 'react';
import type { SephirahData, PathData } from '../types/treeOfLife';

interface InfoPanelProps {
  sephirah: SephirahData | null;
  pathData: PathData | null;
  isPathPinned: boolean;
  onUnpinPath: () => void;
  isSephirahPinned: boolean;
  onUnpinSephirah: () => void;
  selectedWorld: string;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ sephirah, pathData, isPathPinned, onUnpinPath, isSephirahPinned, onUnpinSephirah, selectedWorld }) => {
  if (!sephirah && !pathData) {
    return (
      <div className="info-panel">
        <div className="info-panel-content">
          <h3>Tree of Life</h3>
          <p>Click on a sephirah or path to see its correspondences.</p>
        </div>
      </div>
    );
  }

  if (sephirah) {
    // Get the color for the selected world
    const worldColor = sephirah.worldColors[selectedWorld as keyof typeof sephirah.worldColors]?.color || 'Unknown';

    return (
      <div className="info-panel">
        <div className="info-panel-content">
          <div className="info-header">
            <h3>{sephirah.name}</h3>
            {isSephirahPinned && (
              <button 
                className="unpin-button" 
                onClick={onUnpinSephirah}
                title="Click to unpin this sephirah"
              >
                ✕ 
              </button>
            )}
          </div>
          <table className="info-table">
            <tbody>
              <tr>
                <td className="label">Hebrew:</td>
                <td className="value hebrew-text">{sephirah.metadata.hebrewName}</td>
              </tr>
              <tr>
                <td className="label">English:</td>
                <td className="value">{sephirah.metadata.englishName}</td>
              </tr>
              <tr>
                <td className="label">Planetary:</td>
                <td className="value">{sephirah.metadata.planetarySymbol} {sephirah.metadata.planetaryCorrespondence}</td>
              </tr>
              <tr>
                <td className="label">Element:</td>
                <td className="value">{sephirah.metadata.element}</td>
              </tr>
              <tr>
                <td className="label">Color ({selectedWorld}):</td>
                <td className="value">{worldColor}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (pathData) {
    return (
      <div className="info-panel">
        <div className="info-panel-content">
          <div className="info-header">
            <h3>Path {pathData.pathNumber} {pathData.hebrewLetterName} <strong style={{ fontSize: '1.2em' }}>{pathData.hebrewLetter}</strong></h3>
            {isPathPinned && (
              <button 
                className="unpin-button" 
                onClick={onUnpinPath}
                title="Click to unpin this path"
              >
                ✕ 
              </button>
            )}
          </div>

          {/* Tarot Image */}
          {pathData.tarotImage && (
            <div className="tarot-image-container">
              <img
                src={pathData.tarotImage}
                alt={`${pathData.tarotCard} tarot card`}
                className="tarot-image"
              />
            </div>
          )}

          <table className="info-table">
            <tbody>
              <tr>
                <td className="label">Letter Meaning</td>
                <td className="value hebrew-text">{pathData.letterMeaning}</td>
              </tr>
              <tr>
                <td className="label">Gematria Value:</td>
                <td className="value">{pathData.gematriaValue}</td>
              </tr>
              {/* <tr>
                <td className="label">Tarot Card:</td>
                <td className="value">{pathData.tarotCard}</td>
              </tr> */}
              <tr>
                <td className="label">Astrological:</td>
                <td className="value">{pathData.astrologicalSymbol} {pathData.astrologicalSign}</td>
              </tr>
              <tr>
                <td className="label">Element:</td>
                <td className="value">{pathData.element} {pathData.elementSymbol}</td>
              </tr>
              <tr>
                <td className="label">Musical Note:</td>
                <td className="value">{pathData.musicalNote}</td>
              </tr>
            </tbody>
          </table>

        </div>
      </div>
    );
  }

  return null;
};

export default InfoPanel;
