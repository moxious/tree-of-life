import React from 'react';

interface WorldInfoProps {
  world: any;
}

const WorldInfo: React.FC<WorldInfoProps> = ({ world }) => {
  return (
    <div className="world-info">
      <h1 className="world-title">
        <span className="world-title-hebrew">{world.metadata.hebrewName}</span>
        <span className="world-title-english">{world.metadata.englishName}</span>
      </h1>
      <p className="world-description">{world.metadata.description}</p>
    </div>
  );
};

export default WorldInfo;
