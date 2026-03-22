import { Link } from "react-router-dom";
import styles from "../../App.module.css";

function NavBar() {
  return (
    <header className={styles.navbar}>
      <div className={styles.navbarInner}>
        <Link className={styles.brand} to="/">
          <span className={styles.brandMark}>K</span>
          <span className={styles.brandText}>Kinopoisk</span>
        </Link>

        <nav className={styles.navLinks}>
          <Link className={styles.navLink} to="/">
            Фильмы
          </Link>
          <Link className={styles.navLink} to="/favourites">
            Избранное
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default NavBar;
