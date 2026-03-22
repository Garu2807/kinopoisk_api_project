import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { addToFavorites, removeFromFavorites } from "../favourites/FavouritesSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import styles from "./Movies.module.css";
import type { Movie } from "./types/Movie";

export type MovieProps = {
  movie: Movie;
  isCompared?: boolean;
  onCompareToggle?: (movie: Movie) => void;
};

function MovieItem({
  movie,
  isCompared = false,
  onCompareToggle,
}: MovieProps): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const isFavourite = useAppSelector((state) =>
    state.favourites.favourites.some((favouriteMovie) => favouriteMovie.id === movie.id),
  );

  useEffect(() => {
    if (!isConfirmOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setIsConfirmOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isConfirmOpen]);

  const handleToggleFavourite = (): void => {
    if (isFavourite) {
      dispatch(removeFromFavorites(movie));
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleConfirmAdd = (): void => {
    dispatch(addToFavorites(movie));
    setIsConfirmOpen(false);
  };

  const handleClick = (): void => {
    navigate(`/${movie.id}`);
  };

  const posterUrl = movie.poster?.previewUrl ?? movie.poster?.url;
  const movieName = movie.name ?? movie.alternativeName ?? "Без названия";
  const rating = movie.rating?.imdb ?? "N/A";

  return (
    <article className={styles.movie_item}>
      <button className={styles.posterButton} onClick={handleClick} type="button">
        <span className={styles.rating}>{rating}</span>
        {posterUrl ? (
          <img className={styles.movie_img} src={posterUrl} alt={movieName} />
        ) : (
          <div className={styles.movie_img} aria-hidden="true" />
        )}
      </button>
      <div className={styles.movie_info}>
        <p className={styles.name}>{movieName}</p>
        <p className={styles.meta}>
          {movie.year ?? "Год неизвестен"}
          {movie.genres?.[0]?.name ? ` • ${movie.genres[0].name}` : ""}
        </p>
      </div>
      <div className={styles.movieActions}>
        <button
          className={isFavourite ? styles.removeButton : styles.favoriteButton}
          onClick={handleToggleFavourite}
          type="button"
        >
          {isFavourite ? "Убрать из избранного" : "Добавить в избранное"}
        </button>
        <button
          className={isCompared ? styles.compareButtonActive : styles.compareButton}
          onClick={() => onCompareToggle?.(movie)}
          type="button"
        >
          {isCompared ? "Убрать из сравнения" : "Сравнить"}
        </button>
      </div>

      {isConfirmOpen ? (
        <div
          aria-hidden="true"
          className={styles.modalOverlay}
          onClick={() => setIsConfirmOpen(false)}
        >
          <div
            aria-modal="true"
            className={styles.modal}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <p className={styles.modalTitle}>Добавить в избранное?</p>
            <p className={styles.modalText}>
              Фильм "{movieName}" будет сохранен в списке избранного.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.modalGhostButton}
                onClick={() => setIsConfirmOpen(false)}
                type="button"
              >
                Отмена
              </button>
              <button
                className={styles.modalPrimaryButton}
                onClick={handleConfirmAdd}
                type="button"
              >
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

export default MovieItem;
