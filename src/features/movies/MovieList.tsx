import { useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import useDebounce from "../../hooks/useDebounce";
import { getMovies } from "./api";
import MovieItem from "./MovieItem";
import styles from "./Movies.module.css";
import type { Movie } from "./types/Movie";

function MovieList() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [compareMovies, setCompareMovies] = useState<Movie[]>([]);

  const debouncedScrollPosition = useDebounce(scrollPosition, 180);

  const { data, isPending, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["movies"],
      queryFn: ({ pageParam }) => getMovies(pageParam),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.length === 0) {
          return undefined;
        }

        return allPages.length + 1;
      },
    });

  useEffect(() => {
    const handleScroll = (): void => {
      setScrollPosition(window.scrollY + window.innerHeight);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const documentHeight = document.documentElement.scrollHeight;
    const isNearBottom = debouncedScrollPosition >= documentHeight - 280;

    if (!isNearBottom || !hasNextPage || isFetchingNextPage) {
      return;
    }

    void fetchNextPage();
  }, [debouncedScrollPosition, fetchNextPage, hasNextPage, isFetchingNextPage]);

  const movies = data?.pages.flatMap((page) => page) ?? [];

  const handleCompareToggle = (movie: Movie): void => {
    setCompareMovies((currentMovies) => {
      const isSelected = currentMovies.some(
        (selectedMovie) => selectedMovie.id === movie.id,
      );

      if (isSelected) {
        return currentMovies.filter((selectedMovie) => selectedMovie.id !== movie.id);
      }

      if (currentMovies.length < 2) {
        return [...currentMovies, movie];
      }

      return [currentMovies[1], movie];
    });
  };

  if (isPending) {
    return <div className={styles.status}>Loading...</div>;
  }

  if (isError) {
    return <div className={styles.status}>Error: {error.message}</div>;
  }

  return (
    <section className={styles.movie_list}>
      <div className={styles.hero}>
        <p className={styles.kicker}>Kinopoisk</p>
        <h1 className={styles.top}>Фильмы</h1>
      </div>

      <section className={styles.compareSection}>
        <div className={styles.compareHeader}>
          <p className={styles.compareKicker}>Compare</p>
          <h2 className={styles.compareTitle}>Сравнение фильмов</h2>
          <p className={styles.compareHint}>
            Можно выбрать до двух фильмов. При выборе третьего первый выбор автоматически заменяется.
          </p>
        </div>

        {compareMovies.length > 0 ? (
          <div className={styles.compareTable}>
            <div className={styles.compareRow}>
              <span className={styles.compareLabel}>Поле</span>
              {compareMovies.map((movie) => (
                <span className={styles.compareValue} key={movie.id}>
                  {movie.name ?? movie.alternativeName ?? "Без названия"}
                </span>
              ))}
            </div>
            <div className={styles.compareRow}>
              <span className={styles.compareLabel}>Название</span>
              {compareMovies.map((movie) => (
                <span className={styles.compareValue} key={`${movie.id}-name`}>
                  {movie.name ?? movie.alternativeName ?? "Без названия"}
                </span>
              ))}
            </div>
            <div className={styles.compareRow}>
              <span className={styles.compareLabel}>Год выпуска</span>
              {compareMovies.map((movie) => (
                <span className={styles.compareValue} key={`${movie.id}-year`}>
                  {movie.year ?? "Не указан"}
                </span>
              ))}
            </div>
            <div className={styles.compareRow}>
              <span className={styles.compareLabel}>Рейтинг</span>
              {compareMovies.map((movie) => (
                <span className={styles.compareValue} key={`${movie.id}-rating`}>
                  {movie.rating?.imdb ?? "N/A"}
                </span>
              ))}
            </div>
            <div className={styles.compareRow}>
              <span className={styles.compareLabel}>Жанры</span>
              {compareMovies.map((movie) => (
                <span className={styles.compareValue} key={`${movie.id}-genres`}>
                  {movie.genres?.map((genre) => genre.name).join(", ") || "Не указаны"}
                </span>
              ))}
            </div>
            <div className={styles.compareRow}>
              <span className={styles.compareLabel}>Длительность</span>
              {compareMovies.map((movie) => (
                <span className={styles.compareValue} key={`${movie.id}-length`}>
                  {movie.movieLength ? `${movie.movieLength} мин` : "Нет данных"}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.compareEmpty}>
            Выбери один или два фильма для сравнения.
          </div>
        )}
      </section>

      <div className={styles.movies}>
        {movies.map((movie) => (
          <MovieItem
            isCompared={compareMovies.some((comparedMovie) => comparedMovie.id === movie.id)}
            key={movie.id}
            movie={movie}
            onCompareToggle={handleCompareToggle}
          />
        ))}
      </div>

      {isFetchingNextPage ? (
        <div className={styles.loaderMore}>Загружаем еще фильмы...</div>
      ) : null}
    </section>
  );
}

export default MovieList;
