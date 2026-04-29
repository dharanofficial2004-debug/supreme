import { Link } from 'react-router-dom';
import logo from '../assets/supreme_logo.webp';
import styles from './ErrorPage.module.css';

export default function ErrorPage() {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <img src={logo} alt="Supreme Multispeciality Hospital" className={styles.logo} />
                <div className={styles.errorHeader}>
                    <span className={styles.errorCode}>404</span>
                </div>
                <h1 className={styles.title}>Location Not Found</h1>
                <p className={styles.message}>
                    The gateway or record you are searching for does not exist or has been moved.
                </p>
                <div className={styles.actionArea}>
                    <Link to="/dashboard" className={styles.btn}>
                        <span className={styles.btnIcon}>📊</span>
                        Return to Logs
                    </Link>
                </div>
            </div>
        </div>
    );
}
