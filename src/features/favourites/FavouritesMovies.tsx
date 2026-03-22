import type { JSX } from 'react';
import { useAppSelector } from '../../redux/store';
import FavouritesItem from './FavouritesItem';
import styles from './Favourites.module.css';

export default function FavoriteMovies(): JSX.Element {
  const { favourites } = useAppSelector((store) => store.favourites);

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <p className={styles.kicker}>Collection</p>
        <h1 className={styles.title}>Избранное</h1>
      </div>
      <div className={styles.grid}>
        {favourites.length > 0 ? (
          favourites.map((movie) => (
            <FavouritesItem movie={movie} key={movie.id} />
          ))
        ) : (
          <p className={styles.empty}>Список избранного пока пуст.</p>
        )}
      </div>
    </section>
  );
}
