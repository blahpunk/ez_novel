import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { updateChapterContent, updateChapterTitle, updateChapterGoal } from '../redux/actions';
import RichTextEditor from './RichTextEditor';
import { EditorState, convertFromRaw, convertToRaw, Modifier } from 'draft-js';
import { rawToText } from '../utils/rawToText';

const EditorShell = styled.section`
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TopBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
`;

const ChapterTitle = styled.h2`
  margin: 0;
  font-size: clamp(1.1rem, 2vw, 1.4rem);
  color: #f8fcff;
  font-family: var(--font-display);
`;

const TitleEditBlock = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  width: 100%;

  input {
    max-width: 360px;
  }
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;

const MutedButton = styled.button`
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 8px 10px;
  font-size: 0.78rem;
  border-radius: 10px;
`;

const StatRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const StatChip = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 0.76rem;
  color: var(--text-secondary);

  strong {
    color: #fff;
  }
`;

const GoalControls = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);

  label {
    font-size: 0.72rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  input {
    width: 90px;
    padding: 6px 8px;
    font-size: 0.8rem;
    border-radius: 8px;
  }
`;

const ProgressBar = styled.div`
  width: 130px;
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.12);
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${({ value }) => value}%;
  background: ${({ value }) => (value >= 100 ? 'linear-gradient(90deg, #2dd4bf, #34d399)' : 'linear-gradient(90deg, #f59e0b, #f97316)')};
`;

const TimerCard = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  padding: 7px 8px;
`;

const TimerValue = styled.strong`
  font-size: 0.82rem;
  color: #fff;
`;

const TimerMeta = styled.span`
  font-size: 0.72rem;
  color: var(--text-muted);
`;

const EditorFrame = styled.div`
  flex: 1;
  min-height: 0;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(4, 9, 18, 0.74);
  padding: 12px;
  box-shadow: var(--shadow-soft);
`;

const WritingCanvas = styled.div`
  height: 100%;
  width: 100%;
  max-width: ${({ focusMode }) => (focusMode ? '860px' : '100%')};
  margin: 0 auto;
  transition: max-width 220ms ease;
`;

const EmptyState = styled.div`
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.03);
  padding: 18px;
`;

const ShortcutsOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(2, 7, 14, 0.64);
  backdrop-filter: blur(2px);
  z-index: 120;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const ShortcutsCard = styled.section`
  width: min(620px, 100%);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 16px;
  background: rgba(7, 13, 24, 0.95);
  box-shadow: var(--shadow-soft);
  padding: 16px;

  h3 {
    margin: 0 0 6px;
    color: #f8fcff;
    font-family: var(--font-display);
  }

  p {
    margin: 0 0 12px;
    color: var(--text-muted);
    font-size: 0.84rem;
  }
`;

const ShortcutsList = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px 10px;
  font-size: 0.84rem;
  color: var(--text-secondary);

  kbd {
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-bottom-width: 2px;
    border-radius: 7px;
    padding: 3px 6px;
    background: rgba(255, 255, 255, 0.05);
    color: #ffffff;
    font-size: 0.75rem;
    white-space: nowrap;
  }
`;

const countWords = (text) => {
  if (!text) return 0;
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
};

const getStoredBool = (key, fallback = false) => {
  try {
    const value = localStorage.getItem(key);
    if (value === null) return fallback;
    return value === '1';
  } catch {
    return fallback;
  }
};

const getStoredNumber = (key, fallback) => {
  try {
    const value = Number(localStorage.getItem(key));
    return Number.isFinite(value) && value > 0 ? value : fallback;
  } catch {
    return fallback;
  }
};

const editorStateFromRaw = (raw) => {
  if (!raw || typeof raw !== 'object' || Object.keys(raw).length === 0) {
    return EditorState.createEmpty();
  }

  try {
    return EditorState.createWithContent(convertFromRaw(raw));
  } catch {
    return EditorState.createEmpty();
  }
};

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

function EditorComponent() {
  const dispatch = useDispatch();
  const { books, selectedBookId } = useSelector((state) => ({
    books: state.books,
    selectedBookId: state.selectedBookId,
  }));

  const currentBook = books.find((book) => book.id === selectedBookId) || null;
  const currentChapter =
    currentBook && currentBook.chapters && currentBook.chapters.length > 0
      ? currentBook.chapters.find((chapter) => chapter.id === currentBook.selectedChapterId) || currentBook.chapters[0]
      : null;

  const chapterId = currentChapter ? currentChapter.id : null;
  const rawSavedContent =
    currentChapter &&
    currentChapter.content &&
    typeof currentChapter.content === 'object' &&
    Object.keys(currentChapter.content).length > 0
      ? currentChapter.content
      : null;

  const [editorState, setEditorState] = useState(() => editorStateFromRaw(rawSavedContent));
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(currentChapter ? currentChapter.title : '');
  const [focusMode, setFocusMode] = useState(() => getStoredBool('ez_novel_focus_mode', false));
  const [fontSize, setFontSize] = useState(() => getStoredNumber('ez_novel_editor_font_size', 17));
  const [goalDraft, setGoalDraft] = useState(String(currentChapter?.goalWords ?? 1200));
  const [sessionRunning, setSessionRunning] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [sessionStartWords, setSessionStartWords] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const prevChapterId = useRef(chapterId);
  const prevSerializedRaw = useRef(rawSavedContent ? JSON.stringify(rawSavedContent) : '');
  const goalInputRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem('ez_novel_focus_mode', focusMode ? '1' : '0');
    } catch {
      // Ignore preference write failures.
    }
  }, [focusMode]);

  useEffect(() => {
    try {
      localStorage.setItem('ez_novel_editor_font_size', String(fontSize));
    } catch {
      // Ignore preference write failures.
    }
  }, [fontSize]);

  useEffect(() => {
    if (!chapterId) {
      setEditorState(EditorState.createEmpty());
      setDraftTitle('');
      setGoalDraft('1200');
      prevChapterId.current = null;
      prevSerializedRaw.current = '';
      return;
    }

    if (chapterId !== prevChapterId.current) {
      setEditorState(editorStateFromRaw(rawSavedContent));
      setDraftTitle(currentChapter.title);
      setGoalDraft(String(currentChapter.goalWords ?? 1200));
      setIsRenaming(false);
      setSessionRunning(false);
      setSessionSeconds(0);
      prevChapterId.current = chapterId;
      prevSerializedRaw.current = rawSavedContent ? JSON.stringify(rawSavedContent) : '';
    }
  }, [chapterId, currentChapter, rawSavedContent]);

  useEffect(() => {
    if (!currentChapter || !rawSavedContent) return;

    const serializedRemote = JSON.stringify(rawSavedContent);
    const serializedLocal = JSON.stringify(convertToRaw(editorState.getCurrentContent()));

    if (serializedRemote !== serializedLocal) {
      setEditorState(editorStateFromRaw(rawSavedContent));
      prevSerializedRaw.current = serializedRemote;
    }
  }, [currentChapter, rawSavedContent]);

  useEffect(() => {
    if (!chapterId) return;

    const rawLocal = convertToRaw(editorState.getCurrentContent());
    const serializedLocal = JSON.stringify(rawLocal);

    if (serializedLocal !== prevSerializedRaw.current) {
      dispatch(updateChapterContent(chapterId, rawLocal));
      prevSerializedRaw.current = serializedLocal;
    }
  }, [editorState, chapterId, dispatch]);

  useEffect(() => {
    if (!sessionRunning) return undefined;

    const id = window.setInterval(() => {
      setSessionSeconds((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(id);
  }, [sessionRunning]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const plainText = useMemo(() => rawToText(convertToRaw(editorState.getCurrentContent())), [editorState]);
  const wordCount = useMemo(() => countWords(plainText), [plainText]);
  const characterCount = plainText.length;
  const readMinutes = Math.max(1, Math.round(wordCount / 220));
  const goalWords = Number.isFinite(currentChapter?.goalWords) ? currentChapter.goalWords : 1200;
  const goalProgress = goalWords > 0 ? Math.min(100, Math.round((wordCount / goalWords) * 100)) : 0;
  const sessionWords = Math.max(0, wordCount - sessionStartWords);

  const toolbarConfig = useMemo(
    () => ({
      options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'link', 'history'],
      inline: { options: ['bold', 'italic', 'underline'] },
      blockType: { inDropdown: true, options: ['Normal', 'H1', 'H2', 'H3', 'Blockquote'] },
      fontSize: { inDropdown: false, options: [12, 14, 16, 18, 20, 24] },
      list: { inDropdown: false, options: ['unordered', 'ordered'] },
      textAlign: { inDropdown: true },
      link: { inDropdown: true },
      history: { inDropdown: false },
    }),
    []
  );

  const handleSaveTitle = () => {
    if (!chapterId) return;
    const cleanedTitle = draftTitle.trim() || 'Untitled Chapter';
    dispatch(updateChapterTitle(chapterId, cleanedTitle));
    setDraftTitle(cleanedTitle);
    setIsRenaming(false);
  };

  const handleSaveGoal = useCallback(() => {
    if (!chapterId) return;
    const parsed = Number(goalDraft);
    const normalized = Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : 1200;
    dispatch(updateChapterGoal(chapterId, normalized));
    setGoalDraft(String(normalized));
  }, [chapterId, dispatch, goalDraft]);

  const insertSceneBreak = useCallback(() => {
    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const nextContent = Modifier.insertText(currentContent, selection, '\n* * *\n');
    const nextState = EditorState.push(editorState, nextContent, 'insert-characters');
    setEditorState(EditorState.forceSelection(nextState, nextContent.getSelectionAfter()));
  }, [editorState]);

  const handleToggleTimer = useCallback(() => {
    setSessionRunning((running) => {
      const next = !running;
      if (next && sessionSeconds === 0) {
        setSessionStartWords(wordCount);
      }
      return next;
    });
  }, [sessionSeconds, wordCount]);

  const handleResetTimer = useCallback(() => {
    setSessionRunning(false);
    setSessionSeconds(0);
    setSessionStartWords(wordCount);
  }, [wordCount]);

  const handleToggleFullscreen = useCallback(async () => {
    if (!frameRef.current) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await frameRef.current.requestFullscreen();
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      const metaOrCtrl = event.metaKey || event.ctrlKey;

      if (event.key === '?' && !metaOrCtrl && !event.altKey) {
        event.preventDefault();
        setShowShortcuts(true);
        return;
      }

      if (event.key === 'Escape' && showShortcuts) {
        setShowShortcuts(false);
        return;
      }

      if (metaOrCtrl && event.shiftKey && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        setFocusMode((value) => !value);
        return;
      }

      if (metaOrCtrl && event.altKey && event.key.toLowerCase() === 's') {
        event.preventDefault();
        insertSceneBreak();
        return;
      }

      if (metaOrCtrl && event.altKey && event.key.toLowerCase() === 't') {
        event.preventDefault();
        handleToggleTimer();
        return;
      }

      if (metaOrCtrl && event.altKey && event.key.toLowerCase() === 'l') {
        event.preventDefault();
        handleToggleFullscreen();
        return;
      }

      if (metaOrCtrl && event.altKey && event.key.toLowerCase() === 'g') {
        event.preventDefault();
        goalInputRef.current?.focus();
        return;
      }

      if (metaOrCtrl && (event.key === '=' || event.key === '+')) {
        event.preventDefault();
        setFontSize((value) => Math.min(23, value + 1));
        return;
      }

      if (metaOrCtrl && event.key === '-') {
        event.preventDefault();
        setFontSize((value) => Math.max(13, value - 1));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showShortcuts, insertSceneBreak, handleToggleFullscreen, handleToggleTimer]);

  if (!currentChapter) {
    return (
      <EmptyState>
        <strong>No chapter selected.</strong>
        <div style={{ marginTop: '6px' }}>Create or select a chapter to start writing.</div>
      </EmptyState>
    );
  }

  return (
    <EditorShell>
      <TopBar>
        <TitleRow>
          {isRenaming ? (
            <TitleEditBlock>
              <input
                type="text"
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
                placeholder="Chapter title"
              />
              <button onClick={handleSaveTitle}>Save title</button>
              <MutedButton onClick={() => setIsRenaming(false)}>Cancel</MutedButton>
            </TitleEditBlock>
          ) : (
            <>
              <ChapterTitle>{currentChapter.title}</ChapterTitle>
              <ActionRow>
                <MutedButton onClick={() => setIsRenaming(true)}>Rename chapter</MutedButton>
                <MutedButton onClick={insertSceneBreak}>Insert scene break</MutedButton>
                <MutedButton onClick={() => setShowShortcuts(true)}>Shortcuts</MutedButton>
              </ActionRow>
            </>
          )}
        </TitleRow>

        <ActionRow>
          <StatRow>
            <StatChip>
              Words <strong>{wordCount.toLocaleString()}</strong>
            </StatChip>
            <StatChip>
              Characters <strong>{characterCount.toLocaleString()}</strong>
            </StatChip>
            <StatChip>
              Read <strong>{readMinutes} min</strong>
            </StatChip>
            <StatChip>
              Goal <strong>{goalProgress}%</strong>
            </StatChip>
          </StatRow>

          <GoalControls>
            <label>Goal</label>
            <input
              ref={goalInputRef}
              type="number"
              min="0"
              value={goalDraft}
              onChange={(event) => setGoalDraft(event.target.value)}
              onBlur={handleSaveGoal}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleSaveGoal();
                  event.currentTarget.blur();
                }
              }}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>words</span>
            <ProgressBar>
              <ProgressFill value={goalProgress} />
            </ProgressBar>
          </GoalControls>

          <TimerCard>
            <TimerValue>{formatDuration(sessionSeconds)}</TimerValue>
            <TimerMeta>session | +{sessionWords.toLocaleString()} words</TimerMeta>
            <MutedButton onClick={handleToggleTimer}>{sessionRunning ? 'Pause' : 'Start'}</MutedButton>
            <MutedButton onClick={handleResetTimer}>Reset</MutedButton>
          </TimerCard>

          <ActionRow>
            <MutedButton onClick={() => setFocusMode((value) => !value)}>
              {focusMode ? 'Disable focus mode' : 'Enable focus mode'}
            </MutedButton>
            <MutedButton onClick={handleToggleFullscreen}>{isFullscreen ? 'Exit full screen' : 'Full screen'}</MutedButton>
            <MutedButton onClick={() => setFontSize((value) => Math.max(13, value - 1))}>A-</MutedButton>
            <MutedButton onClick={() => setFontSize((value) => Math.min(23, value + 1))}>A+</MutedButton>
          </ActionRow>
        </ActionRow>
      </TopBar>

      <EditorFrame ref={frameRef}>
        <WritingCanvas focusMode={focusMode ? 1 : 0}>
          <RichTextEditor
            editorState={editorState}
            onEditorStateChange={setEditorState}
            placeholder="Start writing your chapter..."
            toolbarConfig={toolbarConfig}
            wrapperStyle={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100%',
            }}
            editorStyle={{
              padding: '14px',
              minHeight: isFullscreen ? 'calc(100dvh - 260px)' : 'calc(100vh - 430px)',
              color: '#ecf3ff',
              border: 'none',
              lineHeight: 1.55,
              fontSize: `${fontSize}px`,
              backgroundColor: 'transparent',
            }}
            spellCheck
          />
        </WritingCanvas>
      </EditorFrame>

      {showShortcuts && (
        <ShortcutsOverlay onClick={() => setShowShortcuts(false)}>
          <ShortcutsCard onClick={(event) => event.stopPropagation()}>
            <h3>Editor shortcuts</h3>
            <p>Use these commands for faster drafting.</p>
            <ShortcutsList>
              <span>Toggle focus mode</span>
              <kbd>Ctrl/Cmd + Shift + F</kbd>
              <span>Insert scene break</span>
              <kbd>Ctrl/Cmd + Alt + S</kbd>
              <span>Start/Pause session timer</span>
              <kbd>Ctrl/Cmd + Alt + T</kbd>
              <span>Toggle full screen</span>
              <kbd>Ctrl/Cmd + Alt + L</kbd>
              <span>Focus chapter goal</span>
              <kbd>Ctrl/Cmd + Alt + G</kbd>
              <span>Increase / decrease font</span>
              <kbd>Ctrl/Cmd + + / -</kbd>
              <span>Open shortcuts</span>
              <kbd>Shift + ?</kbd>
            </ShortcutsList>
            <ButtonRow style={{ marginTop: '12px' }}>
              <MutedButton onClick={() => setShowShortcuts(false)}>Close</MutedButton>
            </ButtonRow>
          </ShortcutsCard>
        </ShortcutsOverlay>
      )}
    </EditorShell>
  );
}

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
`;

export default EditorComponent;
