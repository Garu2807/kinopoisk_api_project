import { useQueries } from '@tanstack/react-query';
import type { JSX } from 'react';
import { useAppSelector } from '../../redux/store';
import { getMovieById } from '../movies/api';
import FavouritesItem from './FavouritesItem';
import styles from './Favourites.module.css';

export default function FavoriteMovies(): JSX.Element {
  const { favourites } = useAppSelector((store) => store.favourites);
  const favouriteMoviesQueries = useQueries({
    queries: favourites.map((id) => ({
      queryKey: ['movie', id],
      queryFn: () => getMovieById(id),
      enabled: Number.isFinite(id),
    })),
  });
  const isPending = favouriteMoviesQueries.some((query) => query.isPending);
  const isError = favouriteMoviesQueries.some((query) => query.isError);
  const favouriteMovies = favouriteMoviesQueries
    .map((query) => query.data)
    .filter((movie): movie is NonNullable<typeof movie> => movie !== null && movie !== undefined);

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <p className={styles.kicker}>Collection</p>
        <h1 className={styles.title}>Избранное</h1>
      </div>
      <div className={styles.grid}>
        {favourites.length === 0 ? (
          <p className={styles.empty}>Список избранного пока пуст.</p>
        ) : isPending ? (
          <p className={styles.empty}>Загрузка избранного...</p>
        ) : isError ? (
          <p className={styles.empty}>Не удалось загрузить избранные фильмы.</p>
        ) : favouriteMovies.length > 0 ? (
          favouriteMovies.map((movie) => (
            <FavouritesItem movie={movie} key={movie.id} />
          ))
        ) : (
          <p className={styles.empty}>Избранные фильмы не найдены.</p>
        )}
      </div>
    </section>
  );
}
