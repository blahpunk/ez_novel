// src/redux/reducers/settingsReducer.js
import { SET_INITIAL_DATA } from '../actions';

const defaultState = {
  settings: {},
};

export default function settingsReducer(state = defaultState, action) {
  switch (action.type) {
    case SET_INITIAL_DATA:
      return action.payload && action.payload.settings ? { settings: action.payload.settings } : state;
    default:
      return state;
  }
}

