import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addLocation, removeLocation, updateLocation } from '../../redux/actions';
import styled from 'styled-components';
import RichTextEditor from '../RichTextEditor';
import { rawToHtml } from '../../utils/rawToHtml';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.h4`
  margin: 0;
  color: #f8fbff;
  font-family: var(--font-display);
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ItemCard = styled.article`
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  padding: 10px;
`;

const ItemHeading = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  color: #f9fcff;
  margin-bottom: 6px;
`;

const NoteList = styled.ul`
  list-style: disc;
  margin: 0;
  padding-left: 18px;
  color: var(--text-secondary);
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Input = styled.input`
  font-size: 0.9rem;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const TinyButton = styled.button`
  padding: 7px 10px;
  font-size: 0.76rem;
  border-radius: 9px;
`;

const GhostButton = styled(TinyButton)`
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.16);
`;

const DangerButton = styled(TinyButton)`
  color: #ffd9d9;
  background: rgba(239, 68, 68, 0.16);
  border: 1px solid rgba(239, 68, 68, 0.36);
`;

function LocationsTab() {
  const dispatch = useDispatch();
  const selectedBook = useSelector((state) => state.books.find((book) => book.id === state.selectedBookId));
  const locations = selectedBook ? selectedBook.locations : [];

  const [newName, setNewName] = useState('');
  const [newNote, setNewNote] = useState(null);
  const [newNoteKey, setNewNoteKey] = useState(0);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState([]);

  const fullToolbar = {
    options: ['inline', 'fontSize', 'blockType', 'list', 'textAlign', 'link', 'history'],
    inline: { inDropdown: false, options: ['bold', 'italic', 'underline', 'strikethrough'] },
    fontSize: { inDropdown: false, options: [12, 14, 16, 18, 20] },
    blockType: { inDropdown: true, options: ['Normal', 'H2', 'H3', 'Blockquote'] },
    list: { inDropdown: false, options: ['unordered', 'ordered'] },
    textAlign: { inDropdown: true },
    link: { inDropdown: true },
    history: { inDropdown: false },
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    const notes = newNote ? [newNote] : [];
    dispatch(addLocation(newName, notes));
    setNewName('');
    setNewNote(null);
    setNewNoteKey((value) => value + 1);
  };

  const startEditing = (location) => {
    setEditingId(location.id);
    setEditName(location.name);
    setEditNotes(location.notes && location.notes.length > 0 ? [...location.notes] : [null]);
  };

  const updateEditNoteField = (index, content) => {
    const updated = [...editNotes];
    updated[index] = content;
    setEditNotes(updated);
  };

  const saveEdit = (id) => {
    const notes = editNotes.filter((note) => note && JSON.stringify(note) !== '{}');
    dispatch(updateLocation(id, editName, notes));
    setEditingId(null);
  };

  return (
    <Wrapper>
      <SectionTitle>Locations</SectionTitle>

      <ItemList>
        {locations.map((location) => (
          <ItemCard key={location.id}>
            {editingId === location.id ? (
              <>
                <Input type="text" value={editName} onChange={(event) => setEditName(event.target.value)} />
                {editNotes.map((note, index) => (
                  <div key={index} style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '8px' }}>
                    <RichTextEditor
                      key={index}
                      initialContent={note}
                      onChange={(content) => updateEditNoteField(index, content)}
                      toolbarConfig={fullToolbar}
                      wrapperStyle={{ minHeight: '90px' }}
                      editorStyle={{ padding: '6px', minHeight: '66px', color: '#e8f0ff', lineHeight: 1.45 }}
                    />
                  </div>
                ))}
                <ButtonRow>
                  <GhostButton onClick={() => setEditNotes([...editNotes, null])}>Add note</GhostButton>
                  <TinyButton onClick={() => saveEdit(location.id)}>Save</TinyButton>
                  <GhostButton onClick={() => setEditingId(null)}>Cancel</GhostButton>
                </ButtonRow>
              </>
            ) : (
              <>
                <ItemHeading>{location.name}</ItemHeading>
                <NoteList>
                  {location.notes && location.notes.length > 0 ? (
                    location.notes.map((note, index) => (
                      <li key={index}>
                        <div dangerouslySetInnerHTML={{ __html: rawToHtml(note) }} />
                      </li>
                    ))
                  ) : (
                    <li>No notes yet</li>
                  )}
                </NoteList>
                <ButtonRow style={{ marginTop: '8px' }}>
                  <GhostButton onClick={() => startEditing(location)}>Edit</GhostButton>
                  <DangerButton onClick={() => dispatch(removeLocation(location.id))}>Remove</DangerButton>
                </ButtonRow>
              </>
            )}
          </ItemCard>
        ))}
      </ItemList>

      <SectionTitle style={{ marginTop: '4px' }}>Add Location</SectionTitle>
      <ItemCard>
        <FormRow>
          <Input
            type="text"
            placeholder="Location name"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
          />
          <div style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '8px' }}>
            <RichTextEditor
              key={`new-location-note-${newNoteKey}`}
              initialContent={newNote}
              onChange={setNewNote}
              toolbarConfig={fullToolbar}
              wrapperStyle={{ minHeight: '90px' }}
              editorStyle={{ padding: '6px', minHeight: '66px', color: '#e8f0ff', lineHeight: 1.45 }}
            />
          </div>
          <TinyButton onClick={handleAdd}>Add Location</TinyButton>
        </FormRow>
      </ItemCard>
    </Wrapper>
  );
}

export default LocationsTab;
