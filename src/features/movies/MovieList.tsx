import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import useDebounce from "../../hooks/useDebounce";
import { getMovies } from "./api";
import MovieItem from "./MovieItem";
import styles from "./Movies.module.css";
import type { Movie } from "./types/Movie";

const MIN_YEAR = 1990;
const MAX_YEAR = new Date().getFullYear();
const AVAILABLE_GENRES = [
  "драма",
  "комедия",
  "триллер",
  "боевик",
  "мелодрама",
  "ужасы",
  "фантастика",
  "криминал",
  "приключения",
  "мультфильм",
];

const parseNumberParam = (value: string | null, min: number, max: number) => {
  if (value === null || value === "") {
    return null;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return null;
  }

  return Math.min(max, Math.max(min, parsedValue));
};

function MovieList() {
  const [compareMovies, setCompareMovies] = useState<Movie[]>([]);
  const [isLoadMoreVisible, setIsLoadMoreVisible] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [ratingFromInput, setRatingFromInput] = useState(
    searchParams.get("ratingFrom") ?? "",
  );
  const [ratingToInput, setRatingToInput] = useState(
    searchParams.get("ratingTo") ?? "",
  );
  const [yearFromInput, setYearFromInput] = useState(
    searchParams.get("yearFrom") ?? "",
  );
  const [yearToInput, setYearToInput] = useState(
    searchParams.get("yearTo") ?? "",
  );

  const debouncedLoadMoreVisible = useDebounce(isLoadMoreVisible, 180);

  const selectedGenres =
    searchParams
      .get("genres")
      ?.split(",")
      .map((genre) => genre.trim().toLowerCase())
      .filter(Boolean) ?? [];
  const ratingFrom = parseNumberParam(searchParams.get("ratingFrom"), 0, 10);
  const ratingTo = parseNumberParam(searchParams.get("ratingTo"), 0, 10);
  const yearFrom = parseNumberParam(
    searchParams.get("yearFrom"),
    MIN_YEAR,
    MAX_YEAR,
  );
  const yearTo = parseNumberParam(
    searchParams.get("yearTo"),
    MIN_YEAR,
    MAX_YEAR,
  );
  const ratingFromValue = Number(
    ratingFromInput === "" ? "0" : ratingFromInput,
  );
  const ratingToValue = Number(ratingToInput === "" ? "10" : ratingToInput);
  const yearFromValue = Number(
    yearFromInput === "" ? String(MIN_YEAR) : yearFromInput,
  );
  const yearToValue = Number(
    yearToInput === "" ? String(MAX_YEAR) : yearToInput,
  );

  const {
    data,
    isPending,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
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
    if (!debouncedLoadMoreVisible || !hasNextPage || isFetchingNextPage) {
      return;
    }

    void fetchNextPage();
  }, [
    debouncedLoadMoreVisible,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  ]);

  useEffect(() => {
    setRatingFromInput(searchParams.get("ratingFrom") ?? "");
    setRatingToInput(searchParams.get("ratingTo") ?? "");
    setYearFromInput(searchParams.get("yearFrom") ?? "");
    setYearToInput(searchParams.get("yearTo") ?? "");
  }, [searchParams]);

  const movies = useMemo(() => {
    const allMovies = data?.pages.flatMap((page) => page) ?? [];
    const uniqueMovies = allMovies.filter(
      (movie, index, currentMovies) =>
        currentMovies.findIndex(
          (currentMovie) => currentMovie.id === movie.id,
        ) === index,
    );

    return uniqueMovies.filter((movie) => {
      const movieGenres =
        movie.genres?.map((genre) => genre.name.toLowerCase()) ?? [];
      const movieRating = Number(movie.rating?.imdb ?? 0);
      const movieYear = Number(movie.year ?? 0);

      const matchesGenres =
        selectedGenres.length === 0 ||
        selectedGenres.every((genre) => movieGenres.includes(genre));
      const matchesRating =
        ratingFrom === null || ratingTo === null
          ? true
          : movieRating >= Math.min(ratingFrom, ratingTo) &&
            movieRating <= Math.max(ratingFrom, ratingTo);
      const matchesYear =
        yearFrom === null || yearTo === null
          ? true
          : movieYear >= Math.min(yearFrom, yearTo) &&
            movieYear <= Math.max(yearFrom, yearTo);

      return matchesGenres && matchesRating && matchesYear;
    });
  }, [data, ratingFrom, ratingTo, selectedGenres, yearFrom, yearTo]);

  useEffect(() => {
    const currentLoadMoreElement = loadMoreRef.current;

    if (!currentLoadMoreElement) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsLoadMoreVisible(entry.isIntersecting);
      },
      {
        rootMargin: "240px 0px",
      },
    );

    observer.observe(currentLoadMoreElement);

    return () => {
      observer.disconnect();
    };
  }, [movies.length]);

  const updateSearchParams = (
    updater: (params: URLSearchParams) => void,
  ): void => {
    const nextParams = new URLSearchParams(searchParams);
    updater(nextParams);
    setSearchParams(nextParams, { replace: true });
  };

  const handleGenreToggle = (genre: string): void => {
    updateSearchParams((params) => {
      const currentGenres =
        params
          .get("genres")
          ?.split(",")
          .map((value) => value.trim().toLowerCase())
          .filter(Boolean) ?? [];

      const nextGenres = currentGenres.includes(genre)
        ? currentGenres.filter((value) => value !== genre)
        : [...currentGenres, genre];

      if (nextGenres.length === 0) {
        params.delete("genres");
        return;
      }

      params.set("genres", nextGenres.join(","));
    });
  };

  const handleRangeChange = (
    key: "ratingFrom" | "ratingTo" | "yearFrom" | "yearTo",
    value: string,
  ): void => {
    updateSearchParams((params) => {
      if (value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    if (key === "ratingFrom") {
      setRatingFromInput(value);
      return;
    }

    if (key === "ratingTo") {
      setRatingToInput(value);
      return;
    }

    if (key === "yearFrom") {
      setYearFromInput(value);
      return;
    }

    setYearToInput(value);
  };

  const handleSliderChange = (
    key: "ratingFrom" | "ratingTo" | "yearFrom" | "yearTo",
    rawValue: string,
  ): void => {
    const nextValue = Number(rawValue);

    if (key === "ratingFrom") {
      handleRangeChange(key, String(Math.min(nextValue, ratingToValue)));
      return;
    }

    if (key === "ratingTo") {
      handleRangeChange(key, String(Math.max(nextValue, ratingFromValue)));
      return;
    }

    if (key === "yearFrom") {
      handleRangeChange(key, String(Math.min(nextValue, yearToValue)));
      return;
    }

    handleRangeChange(key, String(Math.max(nextValue, yearFromValue)));
  };

  const handleResetFilters = (): void => {
    setRatingFromInput("");
    setRatingToInput("");
    setYearFromInput("");
    setYearToInput("");
    setSearchParams({}, { replace: true });
  };

  const handleCompareToggle = (movie: Movie): void => {
    setCompareMovies((currentMovies) => {
      const exists = currentMovies.some(
        (currentMovie) => currentMovie.id === movie.id,
      );

      if (exists) {
        return currentMovies.filter(
          (currentMovie) => currentMovie.id !== movie.id,
        );
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

      <section className={styles.filtersSection}>
        <div className={styles.filtersHeader}>
          <div>
            <p className={styles.filtersKicker}>Filters</p>
            <h2 className={styles.filtersTitle}>Фильтрация</h2>
          </div>
          <button
            className={styles.resetFiltersButton}
            onClick={handleResetFilters}
            type="button"
          >
            Сбросить
          </button>
        </div>

        <div className={styles.filtersGrid}>
          <div className={styles.filterBlock}>
            <p className={styles.filterLabel}>Жанры</p>
            <div className={styles.genreList}>
              {AVAILABLE_GENRES.map((genre) => {
                const isActive = selectedGenres.includes(genre);

                return (
                  <button
                    className={
                      isActive ? styles.genreChipActive : styles.genreChip
                    }
                    key={genre}
                    onClick={() => handleGenreToggle(genre)}
                    type="button"
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.filterBlock}>
            <p className={styles.filterLabel}>Рейтинг</p>
            <div className={styles.sliderGroup}>
              <div className={styles.sliderValues}>
                <span>От {ratingFromValue.toFixed(1)}</span>
                <span>До {ratingToValue.toFixed(1)}</span>
              </div>
              <div className={styles.sliderStack}>
                <input
                  className={styles.slider}
                  max={10}
                  min={0}
                  onChange={(event) =>
                    handleSliderChange("ratingFrom", event.target.value)
                  }
                  step="0.1"
                  type="range"
                  value={ratingFromValue}
                />
                <input
                  className={styles.slider}
                  max={10}
                  min={0}
                  onChange={(event) =>
                    handleSliderChange("ratingTo", event.target.value)
                  }
                  step="0.1"
                  type="range"
                  value={ratingToValue}
                />
              </div>
              <div className={styles.sliderHint}>Диапазон IMDb от 0 до 10</div>
            </div>
          </div>

          <div className={styles.filterBlock}>
            <p className={styles.filterLabel}>Год выпуска</p>
            <div className={styles.sliderGroup}>
              <div className={styles.sliderValues}>
                <span>От {yearFromValue}</span>
                <span>До {yearToValue}</span>
              </div>
              <div className={styles.sliderStack}>
                <input
                  className={styles.slider}
                  max={MAX_YEAR}
                  min={MIN_YEAR}
                  onChange={(event) =>
                    handleSliderChange("yearFrom", event.target.value)
                  }
                  step="1"
                  type="range"
                  value={yearFromValue}
                />
                <input
                  className={styles.slider}
                  max={MAX_YEAR}
                  min={MIN_YEAR}
                  onChange={(event) =>
                    handleSliderChange("yearTo", event.target.value)
                  }
                  step="1"
                  type="range"
                  value={yearToValue}
                />
              </div>
              <div className={styles.sliderHint}>
                Диапазон лет начиная с {MIN_YEAR}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.compareSection}>
        <div className={styles.compareHeader}>
          <p className={styles.compareKicker}>Compare</p>
          <h2 className={styles.compareTitle}>Сравнение фильмов</h2>
          <p className={styles.compareHint}>
            Можно выбрать до двух фильмов. При выборе третьего первый
            автоматически заменяется.
          </p>
        </div>

        {compareMovies.length === 0 ? (
          <div className={styles.compareEmpty}>
            Выбери один или два фильма для сравнения.
          </div>
        ) : (
          <div className={styles.compareTable}>
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
                <span
                  className={styles.compareValue}
                  key={`${movie.id}-rating`}
                >
                  {movie.rating?.imdb ?? "N/A"}
                </span>
              ))}
            </div>
            <div className={styles.compareRow}>
              <span className={styles.compareLabel}>Жанры</span>
              {compareMovies.map((movie) => (
                <span
                  className={styles.compareValue}
                  key={`${movie.id}-genres`}
                >
                  {movie.genres?.map((genre) => genre.name).join(", ") ||
                    "Не указаны"}
                </span>
              ))}
            </div>
            <div className={styles.compareRow}>
              <span className={styles.compareLabel}>Длительность</span>
              {compareMovies.map((movie) => (
                <span
                  className={styles.compareValue}
                  key={`${movie.id}-length`}
                >
                  {movie.movieLength
                    ? `${movie.movieLength} мин`
                    : "Нет данных"}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      <div className={styles.movies}>
        {movies.map((movie) => (
          <MovieItem
            isCompared={compareMovies.some(
              (compareMovie) => compareMovie.id === movie.id,
            )}
            key={movie.id}
            movie={movie}
            onCompareToggle={handleCompareToggle}
          />
        ))}
      </div>

      {movies.length === 0 ? (
        <div className={styles.emptyFiltered}>
          По текущим фильтрам фильмы не найдены.
        </div>
      ) : null}

      <div aria-hidden="true" ref={loadMoreRef} />

      {isFetchingNextPage ? (
        <div className={styles.loaderMore}>Загружаем еще фильмы...</div>
      ) : null}
    </section>
  );
}

export default MovieList;
