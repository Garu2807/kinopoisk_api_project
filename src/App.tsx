import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import FavouritesMovies from "./features/favourites/FavouritesMovies";
import MovieList from "./features/movies/MovieList";
import { Route, Routes } from "react-router-dom";
import MoviePage from "./features/movies/MoviePage";
import NavBar from "./features/navbar/NavBar";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavBar />
      <Routes>
        <Route path="/" element={<MovieList />} />
        <Route path="/favourites" element={<FavouritesMovies />} />
        <Route path="/:id" element={<MoviePage />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
