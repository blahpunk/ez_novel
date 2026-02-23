// src/redux/reducers/locationReducer.js
import { ADD_LOCATION, REMOVE_LOCATION, SET_INITIAL_DATA } from '../actions';

const defaultState = {
  locations: [],
};

export default function locationReducer(state = defaultState, action) {
  switch (action.type) {
    case SET_INITIAL_DATA:
      return action.payload && Array.isArray(action.payload.locations)
        ? { locations: action.payload.locations }
        : state;
    case ADD_LOCATION:
      const newLocation = { id: Date.now(), name: action.payload.name, note: action.payload.note };
      return { ...state, locations: [...state.locations, newLocation] };
    case REMOVE_LOCATION:
      return { ...state, locations: state.locations.filter(l => l.id !== action.payload) };
    default:
      return state;
  }
}

