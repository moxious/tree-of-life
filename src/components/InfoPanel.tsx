import React from 'react';

interface InfoPanelProps {
  sephirah: {
    name: string;
    metadata: {
      hebrewName: string;
      englishName: string;
      planetaryCorrespondence: string;
      planetarySymbol: string;
      element: string;
    };
    worldColors: {
      assiah: { color: string };
      yetzirah: { color: string };
      briah: { color: string };
      atziluth: { color: string };
    };
  } | null;
  pathData: {
    pathNumber: number;
    hebrewLetter: string;
    hebrewLetterName: string;
    tarotCard: string;
    tarotNumber: number;
    astrologicalSign: string;
    astrologicalSymbol: string;
    element: string;
    letterMeaning: string;
    musicalNote: string;
    gematriaValue: number;
  } | null;
  selectedWorld: string;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ sephirah, pathData, selectedWorld }) => {
  if (!sephirah && !pathData) {
    return (
      <div className="info-panel">
        <div className="info-panel-content">
          <h3>Tree of Life</h3>
          <p>Hover over a sephirah or path to see its correspondences.</p>
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
            <h3>Path {pathData.pathNumber}</h3>
          </div>
          <table className="info-table">
            <tbody>
              <tr>
                <td className="label">Hebrew Letter:</td>
                <td className="value hebrew-text">{pathData.hebrewLetter}</td>
              </tr>
              <tr>
                <td className="label">Letter Name:</td>
                <td className="value">{pathData.hebrewLetterName}</td>
              </tr>
              <tr>
                <td className="label">Letter Meaning:</td>
                <td className="value">{pathData.letterMeaning}</td>
              </tr>
              <tr>
                <td className="label">Gematria Value:</td>
                <td className="value">{pathData.gematriaValue}</td>
              </tr>
              <tr>
                <td className="label">Tarot Card:</td>
                <td className="value">{pathData.tarotCard}</td>
              </tr>
              <tr>
                <td className="label">Tarot Number:</td>
                <td className="value">{pathData.tarotNumber}</td>
              </tr>
              <tr>
                <td className="label">Astrological:</td>
                <td className="value">{pathData.astrologicalSymbol} {pathData.astrologicalSign}</td>
              </tr>
              <tr>
                <td className="label">Element:</td>
                <td className="value">{pathData.element}</td>
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
