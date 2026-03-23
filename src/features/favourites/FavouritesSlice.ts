import { createSlice } from '@reduxjs/toolkit';
import type { FavouritesState } from './types/FavouritesState';

const getInitialStateFromLocalStorage = (): FavouritesState => {
  const savedState = localStorage.getItem('favourites');

  if (!savedState) {
    return { favourites: [] };
  }

  const parsedState = JSON.parse(savedState) as {
    favourites?: Array<number | { id?: number }>;
  };

  return {
    favourites:
      parsedState.favourites
        ?.map((favourite) =>
          typeof favourite === 'number' ? favourite : favourite.id,
        )
        .filter((id): id is number => Number.isInteger(id)) ?? [],
  };
};

const initialState: FavouritesState = getInitialStateFromLocalStorage();

const saveStateToLocalStorage = (state: FavouritesState): void => {
  localStorage.setItem('favourites', JSON.stringify(state));
};

const FavouritesSlice = createSlice({
  name: 'favourites',
  initialState,
  reducers: {
    addToFavorites: (state, action) => {
      const id = action.payload as number;
      const isAlreadyAdded = state.favourites.includes(id);

      if (!isAlreadyAdded) {
        state.favourites.push(id);
        saveStateToLocalStorage(state);
      }
    },
    removeFromFavorites: (state, action) => {
      const id = action.payload as number;
      state.favourites = state.favourites.filter((favouriteId) => favouriteId !== id);
      saveStateToLocalStorage(state);
    },
  },
});

export const { addToFavorites, removeFromFavorites } = FavouritesSlice.actions;

export default FavouritesSlice.reducer;
