import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addCharacter, removeCharacter, updateCharacter } from '../../redux/actions';
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

function CharactersTab() {
  const dispatch = useDispatch();
  const selectedBook = useSelector((state) =>
    state.books.find((b) => b.id === state.selectedBookId)
  );
  const characters = selectedBook ? selectedBook.characters : [];

  // State for new character
  const [newName, setNewName] = useState('');
  const [newNote, setNewNote] = useState(null);

  // State for editing an existing character (multiple note fields)
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState([]);

  // Full toolbar configuration for rich text (horizontal row)
  const fullToolbar = {
    options: ['inline', 'fontSize', 'blockType', 'list', 'textAlign', 'colorPicker', 'link', 'emoji', 'history'],
    inline: { inDropdown: false, options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace'] },
    fontSize: { inDropdown: false, options: [8, 9, 10, 11, 12, 14, 16, 18, 24] },
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
      dispatch(addCharacter(newName, notes));
      setNewName('');
      setNewNote(null);
    }
  };

  const startEditing = (char) => {
    setEditingId(char.id);
    setEditName(char.name);
    setEditNotes(char.notes && char.notes.length > 0 ? [...char.notes] : [null]);
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
    dispatch(updateCharacter(id, editName, notes));
    setEditingId(null);
  };

  return (
    <div>
      <h4 style={{ color: '#fff' }}>Characters</h4>
      <NoteList>
        {characters.map((char) => (
          <ListItem key={char.id}>
            {editingId === char.id ? (
              <>
                <Input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} />
                {editNotes.map((note, index) => (
                  <div key={index} style={{ border: '1px solid #ccc', padding: '5px', marginBottom: '5px' }}>
                    <RichTextEditor
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
                        lineHeight: '1.4'
                      }}
                    />
                  </div>
                ))}
                <Button onClick={addEditNoteField}>Add Note</Button>
                <div>
                  <Button onClick={() => saveEdit(char.id)}>Save</Button>
                  <Button onClick={() => setEditingId(null)}>Cancel</Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <strong>{char.name}</strong>
                </div>
                <NoteList>
                  {char.notes && char.notes.length > 0 ? (
                    char.notes.map((n, i) => (
                      <li key={i}>
                        <div dangerouslySetInnerHTML={{ __html: rawToHtml(n) }} />
                      </li>
                    ))
                  ) : (
                    <li>No notes</li>
                  )}
                </NoteList>
                <div>
                  <Button onClick={() => startEditing(char)}>Edit</Button>
                  <Button onClick={() => dispatch(removeCharacter(char.id))}>Remove</Button>
                </div>
              </>
            )}
          </ListItem>
        ))}
      </NoteList>
      <h5 style={{ color: '#fff' }}>Add New Character</h5>
      <FormRow>
        <Input type="text" placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <div style={{ border: '1px solid #ccc', padding: '5px' }}>
          <RichTextEditor
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
        <Button onClick={handleAdd}>Add Character</Button>
      </FormRow>
    </div>
  );
}

export default CharactersTab;
