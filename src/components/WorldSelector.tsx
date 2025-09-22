import React from 'react';

interface WorldSelectorProps {
  selectedWorld: string;
  onWorldChange: (world: string) => void;
  worlds: any;
}

const WorldSelector: React.FC<WorldSelectorProps> = ({ selectedWorld, onWorldChange, worlds }) => {
  const worldOrder = [
    { key: 'assiah', transliteration: 'Assiah' },
    { key: 'yetzirah', transliteration: 'Yetzirah' },
    { key: 'briah', transliteration: 'Briah' },
    { key: 'atziluth', transliteration: 'Atziluth' }
  ];

  return (
    <div className="control-container control-container--horizontal">
      {worldOrder.map(({ key, transliteration }) => {
        const world = worlds[key];
        return (
          <button
            key={key}
            className={`world-button ${selectedWorld === key ? 'active' : ''}`}
            onClick={() => onWorldChange(key)}
          >
            <span className="world-hebrew">{world.metadata.hebrewName}</span>
            <span className="world-english">{transliteration}</span>
          </button>
        );
      })}
    </div>
  );
};

export default WorldSelector;
