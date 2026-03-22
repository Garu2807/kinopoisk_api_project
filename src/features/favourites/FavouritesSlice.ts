import { createSlice } from '@reduxjs/toolkit';
import type { FavouritesState } from './types/FavouritesState';

const getInitialStateFromLocalStorage = (): FavouritesState => {
  const savedState = localStorage.getItem('favouritesState');
  return savedState ? JSON.parse(savedState) : { favourites: [] };
};

const initialState: FavouritesState = getInitialStateFromLocalStorage();

const FavouritesSlice = createSlice({
  name: 'favourites',
  initialState,
  reducers: {
    addToFavorites: (state, action) => {
      const { id } = action.payload;
      const isAlreadyAdded = state.favourites.some((movie) => movie.id === id);
      if (!isAlreadyAdded) {
        state.favourites.push(action.payload);
        localStorage.setItem('favouritesState', JSON.stringify(state));
      }
    },
    removeFromFavorites: (state, action) => {
      const { id } = action.payload;
      state.favourites = state.favourites.filter((movie) => movie.id !== id);
      localStorage.setItem('favouritesState', JSON.stringify(state));
    },
  },
});

export const { addToFavorites, removeFromFavorites } = FavouritesSlice.actions;

export default FavouritesSlice.reducer;
