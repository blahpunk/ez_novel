// src/redux/reducers/chapterReducer.js
import { 
  ADD_CHAPTER, 
  REMOVE_CHAPTER, 
  UPDATE_CHAPTER_CONTENT, 
  SELECT_CHAPTER, 
  SET_INITIAL_DATA 
} from '../actions';

const defaultState = {
  // Set default content as an empty object
  chapters: [{ id: 1, title: 'Chapter 1', content: {} }],
  selectedChapterId: 1,
};

export default function chapterReducer(state = defaultState, action) {
  switch (action.type) {
    case SET_INITIAL_DATA: {
      // If data exists, use fetched chapters and preserve selectedChapterId if available.
      if (action.payload && Array.isArray(action.payload.chapters)) {
        return {
          chapters: action.payload.chapters,
          selectedChapterId: action.payload.chapters[0]?.id || 1,
        };
      }
      return state;
    }
    case ADD_CHAPTER: {
      const newId = state.chapters.length ? state.chapters[state.chapters.length - 1].id + 1 : 1;
      // Use {} for new chapter content
      const newChapter = { id: newId, title: `Chapter ${newId}`, content: {} };
      return {
        ...state,
        chapters: [...state.chapters, newChapter],
        selectedChapterId: newId,
      };
    }
    case REMOVE_CHAPTER:
      return {
        ...state,
        chapters: state.chapters.filter(ch => ch.id !== action.payload),
      };
    case UPDATE_CHAPTER_CONTENT:
      return {
        ...state,
        chapters: state.chapters.map(ch =>
          ch.id === action.payload.id ? { ...ch, content: action.payload.content } : ch
        ),
      };
    case SELECT_CHAPTER:
      return {
        ...state,
        selectedChapterId: action.payload,
      };
    default:
      return state;
  }
}
