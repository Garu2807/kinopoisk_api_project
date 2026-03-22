"use strict";
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as api from './api';
import type { MoviesState } from './types/MoviesState';

const initialState: MoviesState = {
  movies: [],
};

export const loadMovies = createAsyncThunk(
  'movies/loadMovies',
  async () => {
    return api.getMovies();
  }
);

const MovieSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadMovies.fulfilled, (state, action) => {
      state.movies = action.payload;
    });
    builder.addCase(loadMovies.rejected, (_state, action) => {
      console.log(action.error);
    });
  },
});
export default MovieSlice.reducer;
