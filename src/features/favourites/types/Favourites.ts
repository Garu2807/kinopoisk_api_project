export type movie_img = {
  url: string;
  previewUrl: string;
};
export type movie_raiting = {
  imdb: string;
};
export type Genre = {
  name: string;
};
export type back = {
  url: string;
  previewUrl: string;
};
export type Countries = {
  name: string;
};
export type Favourites = {
  id: number;
  name: string;
  aleternativeName: string;
  poster: movie_img;
  year: number;
  rating: movie_raiting;
  alternativeName: string;
  description: string;
  ageRating: number;
  genres: Genre[];
  movieLength: number;
  backdrop: back;
  countries: Countries[];
};
export type MovieId = Favourites['id'];
