import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addPlotPoint, removePlotPoint, updatePlotPoint } from '../../redux/actions';
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
  line-height: 0.8;
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

const NoteDisplay = styled.div`
  white-space: pre-wrap;
`;

function PlotTab() {
  const dispatch = useDispatch();
  const selectedBook = useSelector(state =>
    state.books.find(b => b.id === state.selectedBookId)
  );
  const plotPoints = selectedBook ? selectedBook.plotPoints : [];
  const [newText, setNewText] = useState('');
  const [newNote, setNewNote] = useState(null);
  const [newNoteKey, setNewNoteKey] = useState(0);
  
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editNotes, setEditNotes] = useState([]);

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
    if (newText.trim()) {
      const notes = newNote ? [newNote] : [];
      dispatch(addPlotPoint(newText, notes));
      setNewText('');
      setNewNote(null);
      setNewNoteKey(prev => prev + 1);
    }
  };

  const renderPlotList = () => (
    <NoteList>
      {plotPoints.map(pt => (
        <ListItem key={pt.id}>
          {editingId === pt.id ? (
            <>
              <Input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
              {editNotes.map((note, index) => (
                <div key={index} style={{ border: '1px solid #ccc', padding: '5px', marginBottom: '5px' }}>
                  <RichTextEditor
                    key={index}
                    initialContent={note}
                    onChange={(content) => {
                      const updated = [...editNotes];
                      updated[index] = content;
                      setEditNotes(updated);
                    }}
                    toolbarConfig={fullToolbar}
                    wrapperStyle={{ minHeight: '80px' }}
                    editorStyle={{
                      padding: '5px',
                      minHeight: '60px',
                      backgroundColor: '#2e2e2e',
                      color: '#e0e0e0',
                      border: '1px solid #444',
                      lineHeight: '0.8',
                    }}
                  />
                </div>
              ))}
              <Button onClick={() => setEditNotes([...editNotes, null])}>Add Note</Button>
              <div>
                <Button onClick={() => {
                  const notes = editNotes.filter(n => n && JSON.stringify(n) !== '{}');
                  dispatch(updatePlotPoint(pt.id, editText, notes));
                  setEditingId(null);
                }}>Save</Button>
                <Button onClick={() => setEditingId(null)}>Cancel</Button>
              </div>
            </>
          ) : (
            <>
              <div><strong>{pt.text}</strong></div>
              <NoteList>
                {pt.notes && pt.notes.length > 0 ? (
                  pt.notes.map((n, i) => (
                    <li key={i}>
                      <NoteDisplay dangerouslySetInnerHTML={{ __html: rawToHtml(n) }} />
                    </li>
                  ))
                ) : (
                  <li>No notes</li>
                )}
              </NoteList>
              <div>
                <Button onClick={() => {
                  setEditingId(pt.id);
                  setEditText(pt.text);
                  setEditNotes(pt.notes && pt.notes.length > 0 ? [...pt.notes] : [null]);
                }}>Edit</Button>
                <Button onClick={() => dispatch(removePlotPoint(pt.id))}>Remove</Button>
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
        placeholder="Plot Title"
        value={newText}
        onChange={(e) => setNewText(e.target.value)}
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
      <Button onClick={handleAdd}>Add Plot Point</Button>
    </FormRow>
  );

  return (
    <div>
      <h4 style={{ color: '#fff' }}>Plot Points</h4>
      {renderPlotList()}
      <h5 style={{ color: '#fff' }}>Add New Plot Point</h5>
      {renderAddForm()}
    </div>
  );
}

export default PlotTab;
