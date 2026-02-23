// BOOK actions
export const SET_BOOKS = 'SET_BOOKS';
export const ADD_BOOK = 'ADD_BOOK';
export const SELECT_BOOK = 'SELECT_BOOK';
export const UPDATE_BOOK_TITLE = 'UPDATE_BOOK_TITLE';
export const REMOVE_BOOK = 'REMOVE_BOOK';

// CHAPTER actions
export const ADD_CHAPTER = 'ADD_CHAPTER';
export const REMOVE_CHAPTER = 'REMOVE_CHAPTER';
export const SELECT_CHAPTER = 'SELECT_CHAPTER';
export const UPDATE_CHAPTER_TITLE = 'UPDATE_CHAPTER_TITLE';
export const UPDATE_CHAPTER_CONTENT = 'UPDATE_CHAPTER_CONTENT';
export const UPDATE_CHAPTER_GOAL = 'UPDATE_CHAPTER_GOAL';

// CHARACTER actions
export const ADD_CHARACTER = 'ADD_CHARACTER';
export const REMOVE_CHARACTER = 'REMOVE_CHARACTER';
export const UPDATE_CHARACTER = 'UPDATE_CHARACTER';

// LOCATION actions
export const ADD_LOCATION = 'ADD_LOCATION';
export const REMOVE_LOCATION = 'REMOVE_LOCATION';
export const UPDATE_LOCATION = 'UPDATE_LOCATION';

// PLOT POINT actions
export const ADD_PLOT_POINT = 'ADD_PLOT_POINT';
export const REMOVE_PLOT_POINT = 'REMOVE_PLOT_POINT';
export const UPDATE_PLOT_POINT = 'UPDATE_PLOT_POINT';

// Action creators

// Book actions
export const setBooks = (data) => ({
  type: SET_BOOKS,
  payload: data,
});

export const addBook = (title) => ({
  type: ADD_BOOK,
  payload: { title },
});

export const selectBook = (bookId) => ({
  type: SELECT_BOOK,
  payload: bookId,
});

// Now updateBookTitle expects both bookId and title.
export const updateBookTitle = (bookId, title) => ({
  type: UPDATE_BOOK_TITLE,
  payload: { bookId, title },
});

export const removeBook = (bookId) => ({
  type: REMOVE_BOOK,
  payload: bookId,
});

// Chapter actions
export const addChapter = (customTitle = null) => ({
  type: ADD_CHAPTER,
  payload: customTitle,
});

export const removeChapter = (id) => ({
  type: REMOVE_CHAPTER,
  payload: id,
});

export const selectChapter = (chapterId) => ({
  type: SELECT_CHAPTER,
  payload: chapterId,
});

export const updateChapterTitle = (id, title) => ({
  type: UPDATE_CHAPTER_TITLE,
  payload: { id, title },
});

export const updateChapterContent = (id, content) => ({
  type: UPDATE_CHAPTER_CONTENT,
  payload: { id, content },
});

export const updateChapterGoal = (id, goalWords) => ({
  type: UPDATE_CHAPTER_GOAL,
  payload: { id, goalWords },
});

// Character actions
export const addCharacter = (name, notes = []) => ({
  type: ADD_CHARACTER,
  payload: { name, notes },
});

export const removeCharacter = (id) => ({
  type: REMOVE_CHARACTER,
  payload: id,
});

export const updateCharacter = (id, name, notes) => ({
  type: UPDATE_CHARACTER,
  payload: { id, name, notes },
});

// Location actions
export const addLocation = (name, notes = []) => ({
  type: ADD_LOCATION,
  payload: { name, notes },
});

export const removeLocation = (id) => ({
  type: REMOVE_LOCATION,
  payload: id,
});

export const updateLocation = (id, name, notes) => ({
  type: UPDATE_LOCATION,
  payload: { id, name, notes },
});

// Plot point actions
export const addPlotPoint = (text, notes = []) => ({
  type: ADD_PLOT_POINT,
  payload: { text, notes },
});

export const removePlotPoint = (id) => ({
  type: REMOVE_PLOT_POINT,
  payload: id,
});

export const updatePlotPoint = (id, text, notes) => ({
  type: UPDATE_PLOT_POINT,
  payload: { id, text, notes },
});
