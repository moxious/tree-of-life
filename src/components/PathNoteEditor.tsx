import React from 'react';
import { getSupportedNoteNames } from '../utils/musicalNotes';

interface PathNoteEditorProps {
  pathNumber: number;
  currentNote: string;
  onNoteChange: (pathNumber: number, note: string) => void;
  x: number;
  y: number;
}

const PathNoteEditor: React.FC<PathNoteEditorProps> = ({
  pathNumber,
  currentNote,
  onNoteChange,
  x,
  y
}) => {
  const supportedNotes = getSupportedNoteNames();

  const handleNoteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newNote = event.target.value;
    onNoteChange(pathNumber, newNote);
  };

  return (
    <foreignObject x={x - 20} y={y - 10} width="40" height="20">
      <select
        value={currentNote}
        onChange={handleNoteChange}
        style={{
          width: '100%',
          height: '100%',
          fontSize: '12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          backgroundColor: 'white',
          color: '#333',
          textAlign: 'center',
          cursor: 'pointer'
        }}
        className="path-note-editor"
      >
        {supportedNotes.map(note => (
          <option key={note} value={note}>
            {note}
          </option>
        ))}
      </select>
    </foreignObject>
  );
};

export default PathNoteEditor;
