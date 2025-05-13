// src/redux/store.js
import { createStore } from 'redux';
import booksReducer from './booksReducer';

const store = createStore(
  booksReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;
