// src/redux/reducers/characterReducer.js
import { ADD_CHARACTER, REMOVE_CHARACTER, SET_INITIAL_DATA } from '../actions';

const defaultState = {
  characters: [],
};

export default function characterReducer(state = defaultState, action) {
  switch (action.type) {
    case SET_INITIAL_DATA:
      return action.payload && Array.isArray(action.payload.characters)
        ? { characters: action.payload.characters }
        : state;
    case ADD_CHARACTER:
      const newCharacter = { id: Date.now(), name: action.payload.name, note: action.payload.note };
      return { ...state, characters: [...state.characters, newCharacter] };
    case REMOVE_CHARACTER:
      return { ...state, characters: state.characters.filter(c => c.id !== action.payload) };
    default:
      return state;
  }
}

