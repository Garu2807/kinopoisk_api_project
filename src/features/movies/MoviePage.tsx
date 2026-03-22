import { useQuery } from '@tanstack/react-query';
import type { JSX } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMovieById } from './api';
import styles from './Movies.module.css';

function MoviePage(): JSX.Element {
  const navigate = useNavigate();
  const { id } = useParams();
  const movieId = Number(id);

  const { data: movie, isPending, isError, error } = useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => getMovieById(movieId),
    enabled: Number.isFinite(movieId),
  });

  const handleBackClick = (): void => {
    navigate(-1);
  };

  if (!Number.isFinite(movieId)) {
    return <div className={styles.status}>Некорректный id фильма</div>;
  }

  if (isPending) {
    return <div className={styles.status}>Loading...</div>;
  }

  if (isError) {
    return <div className={styles.status}>Error: {error.message}</div>;
  }

  if (!movie) {
    return (
      <div className={styles.status}>
        <div className={styles.emptyState}>
          <p>Фильм не найден</p>
          <button
            className={styles.backButton}
            onClick={handleBackClick}
            type="button"
          >
            Назад
          </button>
        </div>
      </div>
    );
  }

  const posterUrl = movie.poster?.url ?? movie.poster?.previewUrl;
  const backdropUrl = movie.backdrop?.url ?? movie.backdrop?.previewUrl;
  const movieName = movie.name ?? movie.alternativeName ?? 'Без названия';

  return (
    <section className={styles.moviePage}>
      <div
        className={styles.backdrop}
        style={
          backdropUrl
            ? { backgroundImage: `linear-gradient(180deg, rgba(9, 9, 10, 0.24), #09090a), url(${backdropUrl})` }
            : undefined
        }
      />
      <div className={styles.moviePageContent}>
        {posterUrl ? (
          <img className={styles.detailPoster} src={posterUrl} alt={movieName} />
        ) : (
          <div className={styles.detailPoster} aria-hidden="true" />
        )}

        <div className={styles.detailInfo}>
          <p className={styles.kicker}>Movie</p>
          <h1 className={styles.detailTitle}>{movieName}</h1>
          <p className={styles.detailSubtitle}>
            {movie.alternativeName && movie.alternativeName !== movieName
              ? movie.alternativeName
              : 'Kinopoisk подборка'}
          </p>

          <div className={styles.detailMeta}>
            <span>{movie.rating?.imdb ?? 'N/A'} IMDb</span>
            <span>{movie.year ?? 'Год неизвестен'}</span>
            <span>{movie.movieLength ? `${movie.movieLength} мин` : 'Длительность неизвестна'}</span>
            <span>{movie.ageRating ? `${movie.ageRating}+` : 'Без рейтинга'}</span>
          </div>

          <div className={styles.detailMeta}>
            <span>{movie.genres?.map((genre) => genre.name).join(', ') || 'Жанр не указан'}</span>
            <span>{movie.countries?.map((country) => country.name).join(', ') || 'Страна не указана'}</span>
          </div>

          <p className={styles.description}>
            {movie.description || 'Описание пока отсутствует.'}
          </p>

          <button
            className={styles.backButton}
            onClick={handleBackClick}
            type="button"
          >
            Назад
          </button>
        </div>
      </div>
    </section>
  );
}

export default MoviePage;
