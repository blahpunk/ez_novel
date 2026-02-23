// src/redux/reducers/plotReducer.js
import { ADD_PLOT_POINT, REMOVE_PLOT_POINT, SET_INITIAL_DATA } from '../actions';

const defaultState = {
  plotPoints: [],
};

export default function plotReducer(state = defaultState, action) {
  switch (action.type) {
    case SET_INITIAL_DATA:
      return action.payload && Array.isArray(action.payload.plotPoints)
        ? { plotPoints: action.payload.plotPoints }
        : state;
    case ADD_PLOT_POINT:
      const newPoint = { id: Date.now(), text: action.payload.text, note: action.payload.note };
      return { ...state, plotPoints: [...state.plotPoints, newPoint] };
    case REMOVE_PLOT_POINT:
      return { ...state, plotPoints: state.plotPoints.filter(p => p.id !== action.payload) };
    default:
      return state;
  }
}

