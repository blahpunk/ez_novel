import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addLocation, removeLocation, updateLocation } from '../../redux/actions';
import styled from 'styled-components';
import RichTextEditor from '../RichTextEditor';
import { rawToHtml } from '../../utils/rawToHtml';

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
`;

const Input = styled.input`
  padding: 5px;
  font-size: 0.9rem;
  width: 100%;
  background-color: #2e2e2e;
  color: #e0e0e0;
  border: 1px solid #444;
`;

const NoteList = styled.ul`
  list-style-type: disc;
  padding-left: 20px;
  margin: 0;
  line-height: 1.4;
`;

const ListItem = styled.li`
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 5px;
  font-size: 0.9rem;
  color: #e0e0e0;
  border-bottom: 1px solid #333;
`;

const Button = styled.button`
  padding: 5px 8px;
  font-size: 0.8rem;
  background: #00ff99;
  color: #121212;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  margin-right: 5px;
`;

function LocationsTab() {
  const dispatch = useDispatch();
  const selectedBook = useSelector((state) =>
    state.books.find((b) => b.id === state.selectedBookId)
  );
  const locations = selectedBook ? selectedBook.locations : [];
  
  // For adding a new location
  const [newName, setNewName] = useState('');
  const [newNote, setNewNote] = useState(null);
  const [newNoteKey, setNewNoteKey] = useState(0);
  
  // For editing an existing location
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState([]);
  
  const fullToolbar = {
    options: ['inline', 'fontSize', 'blockType', 'list', 'textAlign', 'colorPicker', 'link', 'emoji', 'history'],
    inline: { inDropdown: false, options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace'] },
    fontSize: { inDropdown: false, options: [8,9,10,11,12,14,16,18,24] },
    blockType: { inDropdown: false, options: ['Normal', 'H1', 'H2', 'H3', 'Blockquote'] },
    list: { inDropdown: false, options: ['unordered', 'ordered'] },
    textAlign: { inDropdown: false, options: ['left', 'center', 'right', 'justify'] },
    colorPicker: { inDropdown: false },
    link: { inDropdown: false },
    emoji: { inDropdown: false },
    history: { inDropdown: false },
  };
  
  const handleAdd = () => {
    if (newName.trim()) {
      const notes = newNote ? [newNote] : [];
      dispatch(addLocation(newName, notes));
      setNewName('');
      setNewNote(null);
      setNewNoteKey(prev => prev + 1);
    }
  };
  
  const startEditing = (loc) => {
    setEditingId(loc.id);
    setEditName(loc.name);
    setEditNotes(loc.notes && loc.notes.length > 0 ? [...loc.notes] : [null]);
  };
  
  const addEditNoteField = () => {
    setEditNotes([...editNotes, null]);
  };
  
  const updateEditNoteField = (index, content) => {
    const updated = [...editNotes];
    updated[index] = content;
    setEditNotes(updated);
  };
  
  const saveEdit = (id) => {
    const notes = editNotes.filter(n => n && JSON.stringify(n) !== '{}');
    dispatch(updateLocation(id, editName, notes));
    setEditingId(null);
  };
  
  const renderLocationList = () => (
    <NoteList>
      {locations.map(loc => (
        <ListItem key={loc.id}>
          {editingId === loc.id ? (
            <>
              <Input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
              />
              {editNotes.map((note, index) => (
                <div key={index} style={{ border: '1px solid #ccc', padding: '5px', marginBottom: '5px' }}>
                  <RichTextEditor
                    key={index}
                    initialContent={note}
                    onChange={(content) => updateEditNoteField(index, content)}
                    toolbarConfig={fullToolbar}
                    wrapperStyle={{ minHeight: '80px' }}
                    editorStyle={{
                      padding: '5px',
                      minHeight: '60px',
                      backgroundColor: '#2e2e2e',
                      color: '#e0e0e0',
                      border: '1px solid #444',
                      lineHeight: '1.4',
                    }}
                  />
                </div>
              ))}
              <Button onClick={addEditNoteField}>Add Note</Button>
              <div>
                <Button onClick={() => saveEdit(loc.id)}>Save</Button>
                <Button onClick={() => setEditingId(null)}>Cancel</Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <strong>{loc.name}</strong>
              </div>
              <NoteList>
                {loc.notes && loc.notes.length > 0 ? (
                  loc.notes.map((n, i) => (
                    <li key={i}>
                      <div dangerouslySetInnerHTML={{ __html: rawToHtml(n) }} />
                    </li>
                  ))
                ) : (
                  <li>No notes</li>
                )}
              </NoteList>
              <div>
                <Button onClick={() => startEditing(loc)}>Edit</Button>
                <Button onClick={() => dispatch(removeLocation(loc.id))}>Remove</Button>
              </div>
            </>
          )}
        </ListItem>
      ))}
    </NoteList>
  );
  
  const renderAddForm = () => (
    <FormRow>
      <Input
        type="text"
        placeholder="Location Name"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
      />
      <div style={{ border: '1px solid #ccc', padding: '5px' }}>
        <RichTextEditor
          key={`newNote-${newNoteKey}`}
          initialContent={newNote}
          onChange={setNewNote}
          toolbarConfig={fullToolbar}
          wrapperStyle={{ minHeight: '80px' }}
          editorStyle={{
            padding: '5px',
            minHeight: '60px',
            backgroundColor: '#2e2e2e',
            color: '#e0e0e0',
            border: '1px solid #444',
          }}
        />
      </div>
      <Button onClick={handleAdd}>Add Location</Button>
    </FormRow>
  );
  
  return (
    <div>
      <h4 style={{ color: '#fff' }}>Locations</h4>
      {renderLocationList()}
      <h5 style={{ color: '#fff' }}>Add New Location</h5>
      {renderAddForm()}
    </div>
  );
}

export default LocationsTab;
