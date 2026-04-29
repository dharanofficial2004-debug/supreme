import { Link } from 'react-router-dom';
import config from '../config/config';
import styles from './Home.module.css';

export default function Home() {
    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <div className={styles.badge}>{config.ORG_SHORT} · EVENT MANAGEMENT</div>
                <h1 className={styles.title}>{config.EVENT_NAME}</h1>
                <p className={styles.tagline}>{config.TAGLINE}</p>

                <div className={styles.eventMeta}>
                    <div className={styles.metaItem}>
                        <span className={styles.metaIcon}>📅</span>
                        <span>{config.EVENT_DATE}</span>
                    </div>
                    <div className={styles.metaItem}>
                        <span className={styles.metaIcon}>🕒</span>
                        <span>{config.EVENT_TIME}</span>
                    </div>
                    <div className={styles.metaItem}>
                        <span className={styles.metaIcon}>📍</span>
                        <span>{config.EVENT_VENUE}</span>
                    </div>
                </div>

                <div className={styles.ctaGrid}>
                    <Link to="/generate" className={styles.ctaCard}>
                        <div className={styles.ctaIcon}>🎟️</div>
                        <div className={styles.ctaContent}>
                            <h3>Guest Entry Passes</h3>
                            <p>Issue and download QR passes for 200 guests</p>
                        </div>
                        <span className={styles.arrow}>→</span>
                    </Link>

                    <Link to="/attendee" className={`${styles.ctaCard} ${styles.primary}`}>
                        <div className={styles.ctaIconWhite}>📷</div>
                        <div className={styles.ctaContent}>
                            <h3>Guest Check-in</h3>
                            <p>Scan entry passes at the hospital entrance</p>
                        </div>
                        <span className={styles.arrow}>→</span>
                    </Link>

                    <Link to="/dashboard" className={styles.ctaCard}>
                        <div className={styles.ctaIcon}>📋</div>
                        <div className={styles.ctaContent}>
                            <h3>Entry Log</h3>
                            <p>Live tracking of guest arrivals</p>
                        </div>
                        <span className={styles.arrow}>→</span>
                    </Link>
                </div>
            </div>

            <footer className={styles.footer}>
                <p>© 2026 {config.ORG_NAME}</p>
                <div className={styles.statusDot}></div>
                <span>Cloud Connected</span>
            </footer>
        </div>
    );
}
