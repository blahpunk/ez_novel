import {
  SET_BOOKS,
  ADD_BOOK,
  SELECT_BOOK,
  UPDATE_BOOK_TITLE,
  REMOVE_BOOK,
  ADD_CHAPTER,
  REMOVE_CHAPTER,
  SELECT_CHAPTER,
  UPDATE_CHAPTER_TITLE,
  UPDATE_CHAPTER_CONTENT,
  UPDATE_CHAPTER_GOAL,
  ADD_CHARACTER,
  REMOVE_CHARACTER,
  UPDATE_CHARACTER,
  ADD_LOCATION,
  REMOVE_LOCATION,
  UPDATE_LOCATION,
  ADD_PLOT_POINT,
  REMOVE_PLOT_POINT,
  UPDATE_PLOT_POINT,
} from './actions';

const initialState = {
  books: [
    {
      id: 1,
      title: 'My First Book',
      chapters: [{ id: 1, title: 'Chapter 1', content: {}, goalWords: 1200 }], // Use {} for default content
      selectedChapterId: 1,
      characters: [],
      locations: [],
      plotPoints: [],
      settings: {},
    },
  ],
  selectedBookId: 1,
};

const createDefaultBook = (id = Date.now()) => ({
  id,
  title: 'Untitled Book',
  chapters: [{ id: 1, title: 'Chapter 1', content: {}, goalWords: 1200 }],
  selectedChapterId: 1,
  characters: [],
  locations: [],
  plotPoints: [],
  settings: {},
});

function booksReducer(state = initialState, action) {
  switch (action.type) {
    case SET_BOOKS: {
      const booksWithDefaultChapter = action.payload.books.map((book) => {
        if (!book.chapters || book.chapters.length === 0) {
          return {
            ...book,
            chapters: [{ id: 1, title: 'Chapter 1', content: {}, goalWords: 1200 }],
            selectedChapterId: 1,
          };
        }
        return {
          ...book,
          chapters: book.chapters.map((chapter) => ({
            ...chapter,
            goalWords: Number.isFinite(chapter.goalWords) && chapter.goalWords >= 0 ? chapter.goalWords : 1200,
          })),
        };
      });
      return {
        ...state,
        books: booksWithDefaultChapter,
        selectedBookId: action.payload.selectedBookId,
      };
    }

    case ADD_BOOK: {
      const newId = Date.now();
      const newBook = {
        id: newId,
        title: action.payload.title || 'Untitled Book',
        chapters: [{ id: 1, title: 'Chapter 1', content: {}, goalWords: 1200 }],
        selectedChapterId: 1,
        characters: [],
        locations: [],
        plotPoints: [],
        settings: {},
      };
      return {
        ...state,
        books: [...state.books, newBook],
        selectedBookId: newId,
      };
    }

    case SELECT_BOOK:
      return { ...state, selectedBookId: action.payload };

    case UPDATE_BOOK_TITLE: {
      const updatedBooks = state.books.map((book) =>
        book.id === action.payload.bookId ? { ...book, title: action.payload.title } : book
      );
      return { ...state, books: updatedBooks };
    }

    case REMOVE_BOOK: {
      const deletedIndex = state.books.findIndex((book) => book.id === action.payload);
      const remainingBooks = state.books.filter((book) => book.id !== action.payload);

      if (remainingBooks.length === 0) {
        const fallbackBook = createDefaultBook();
        return {
          ...state,
          books: [fallbackBook],
          selectedBookId: fallbackBook.id,
        };
      }

      if (state.selectedBookId !== action.payload) {
        return { ...state, books: remainingBooks };
      }

      const fallbackIndex = deletedIndex >= 0 ? Math.min(deletedIndex, remainingBooks.length - 1) : 0;
      return {
        ...state,
        books: remainingBooks,
        selectedBookId: remainingBooks[fallbackIndex].id,
      };
    }

    case ADD_CHAPTER: {
      const updatedBooks = state.books.map((book) => {
        if (book.id === state.selectedBookId) {
          const newId =
            book.chapters.length > 0
              ? book.chapters[book.chapters.length - 1].id + 1
              : 1;
          const newChapter = {
            id: newId,
            title:
              action.payload && action.payload.trim()
                ? action.payload.trim()
                : `Chapter ${newId}`,
            content: {}, // default content as empty object
            goalWords: 1200,
          };
          return {
            ...book,
            chapters: [...book.chapters, newChapter],
            selectedChapterId: newId,
          };
        }
        return book;
      });
      return { ...state, books: updatedBooks };
    }

    case REMOVE_CHAPTER: {
      const updatedBooks = state.books.map((book) => {
        if (book.id === state.selectedBookId) {
          const newChapters = book.chapters.filter((ch) => ch.id !== action.payload);
          return {
            ...book,
            chapters:
              newChapters.length > 0
                ? newChapters
                : [{ id: 1, title: 'Chapter 1', content: {}, goalWords: 1200 }],
            selectedChapterId: newChapters.length > 0 ? book.selectedChapterId : 1,
          };
        }
        return book;
      });
      return { ...state, books: updatedBooks };
    }

    case SELECT_CHAPTER: {
      const updatedBooks = state.books.map((book) => {
        if (book.id === state.selectedBookId) {
          return { ...book, selectedChapterId: action.payload };
        }
        return book;
      });
      return { ...state, books: updatedBooks };
    }

    case UPDATE_CHAPTER_TITLE: {
      const updatedBooks = state.books.map((book) => {
        if (book.id === state.selectedBookId) {
          const updatedChapters = book.chapters.map((ch) =>
            ch.id === action.payload.id ? { ...ch, title: action.payload.title } : ch
          );
          return { ...book, chapters: updatedChapters };
        }
        return book;
      });
      return { ...state, books: updatedBooks };
    }

    case UPDATE_CHAPTER_CONTENT: {
      const updatedBooks = state.books.map((book) => {
        if (book.id === state.selectedBookId) {
          const updatedChapters = book.chapters.map((ch) =>
            ch.id === action.payload.id ? { ...ch, content: action.payload.content } : ch
          );
          return { ...book, chapters: updatedChapters };
        }
        return book;
      });
      return { ...state, books: updatedBooks };
    }

    case UPDATE_CHAPTER_GOAL: {
      const updatedBooks = state.books.map((book) => {
        if (book.id === state.selectedBookId) {
          const updatedChapters = book.chapters.map((ch) =>
            ch.id === action.payload.id ? { ...ch, goalWords: action.payload.goalWords } : ch
          );
          return { ...book, chapters: updatedChapters };
        }
        return book;
      });
      return { ...state, books: updatedBooks };
    }

    // CHARACTER actions – notes are stored as arrays.
    case ADD_CHARACTER: {
      const updatedBooks = state.books.map((book) => {
        if (book.id === state.selectedBookId) {
          const newCharacter = {
            id: Date.now(),
            name: action.payload.name,
            notes: action.payload.notes,
          };
          return { ...book, characters: [...book.characters, newCharacter] };
        }
        return book;
      });
      return { ...state, books: updatedBooks };
    }
    case REMOVE_CHARACTER: {
      const updatedBooks = state.books.map((book) => {
        if (book.id === state.selectedBookId) {
          return { ...book, characters: book.characters.filter((c) => c.id !== action.payload) };
        }
        return book;
      });
      return { ...state, books: updatedBooks };
    }
    case UPDATE_CHARACTER: {
      const updatedBooks = state.books.map((book) => {
        if (book.id === state.selectedBookId) {
          const updatedCharacters = book.characters.map((c) =>
            c.id === action.payload.id
              ? { ...c, name: action.payload.name, notes: action.payload.notes }
              : c
          );
          return { ...book, characters: updatedCharacters };
        }
        return book;
      });
      return { ...state, books: updatedBooks };
    }

    // LOCATION actions – notes stored as arrays.
    case ADD_LOCATION: {
      const updatedBooks = state.books.map((book) => {
        if (book.id === state.selectedBookId) {
          const newLocation = {
            id: Date.now(),
            name: action.payload.name,
            notes: action.payload.notes,
          };
          return { ...book, locations: [...book.locations, newLocation] };
        }
        return book;
      });
      return { ...state, books: updatedBooks };
    }
    case REMOVE_LOCATION: {
      const updatedBooks = state.books.map((book) => {
        if (book.id === state.selectedBookId) {
          return { ...book, locations: book.locations.filter((l) => l.id !== action.payload) };
        }
        return book;
      });
      return { ...state, books: updatedBooks };
    }
    case UPDATE_LOCATION: {
      const updatedBooks = state.books.map((book) => {
        if (book.id === state.selectedBookId) {
          const updatedLocations = book.locations.map((l) =>
            l.id === action.payload.id
              ? { ...l, name: action.payload.name, notes: action.payload.notes }
              : l
          );
          return { ...book, locations: updatedLocations };
        }
        return book;
      });
      return { ...state, books: updatedBooks };
    }

    // PLOT POINT actions – notes stored as arrays.
    case ADD_PLOT_POINT: {
      const updatedBooks = state.books.map((book) => {
        if (book.id === state.selectedBookId) {
          const newPlotPoint = {
            id: Date.now(),
            text: action.payload.text,
            notes: action.payload.notes,
          };
          return { ...book, plotPoints: [...book.plotPoints, newPlotPoint] };
        }
        return book;
      });
      return { ...state, books: updatedBooks };
    }
    case REMOVE_PLOT_POINT: {
      const updatedBooks = state.books.map((book) => {
        if (book.id === state.selectedBookId) {
          return { ...book, plotPoints: book.plotPoints.filter((p) => p.id !== action.payload) };
        }
        return book;
      });
      return { ...state, books: updatedBooks };
    }
    case UPDATE_PLOT_POINT: {
      const updatedBooks = state.books.map((book) => {
        if (book.id === state.selectedBookId) {
          const updatedPlotPoints = book.plotPoints.map((p) =>
            p.id === action.payload.id
              ? { ...p, text: action.payload.text, notes: action.payload.notes }
              : p
          );
          return { ...book, plotPoints: updatedPlotPoints };
        }
        return book;
      });
      return { ...state, books: updatedBooks };
    }

    default:
      return state;
  }
}

export default booksReducer;
