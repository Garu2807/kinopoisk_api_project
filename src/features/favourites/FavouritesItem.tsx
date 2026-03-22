import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../redux/store';
import type { Movie } from '../movies/types/Movie';
import { removeFromFavorites } from './FavouritesSlice';
import styles from './Favourites.module.css';

export type MovieProps = {
  movie: Movie;
};

function FavouritesItem({ movie }: MovieProps): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleRemoveToFavourites = (): void => {
    dispatch(removeFromFavorites(movie));
  };

  const handleClick = (): void => {
    navigate(`/${movie.id}`);
  };

  const posterUrl = movie.poster?.previewUrl ?? movie.poster?.url;
  const movieName = movie.name ?? movie.alternativeName ?? 'Без названия';

  return (
    <article className={styles.card}>
      <button className={styles.posterButton} onClick={handleClick} type="button">
        <span className={styles.rating}>{movie.rating?.imdb ?? 'N/A'}</span>
        {posterUrl ? (
          <img className={styles.poster} src={posterUrl} alt={movieName} />
        ) : (
          <div className={styles.poster} aria-hidden="true" />
        )}
      </button>
      <div className={styles.info}>
        <p className={styles.name}>{movieName}</p>
        <p className={styles.meta}>
          {movie.year ?? 'Год неизвестен'}
          {movie.genres?.[0]?.name ? ` • ${movie.genres[0].name}` : ''}
        </p>
      </div>
      <button
        className={styles.removeButton}
        onClick={handleRemoveToFavourites}
        type="button"
      >
        Удалить из избранного
      </button>
    </article>
  );
}

export default FavouritesItem;
