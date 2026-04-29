import { Outlet, NavLink } from 'react-router-dom';
import logo from '../assets/supreme_logo.webp';
import styles from './Layout.module.css';

const navItems = [
    { to: '/dashboard', label: '📊 Log' },
    { to: '/generate', label: '🎫 Passes' },
    { to: '/attendee', label: '🤳 Scan' },
];

export default function Layout() {
    return (
        <div className={styles.shell}>
            <header className={styles.navbar}>
                <div className={styles.navContainer}>
                    <div className={styles.brand}>
                        <img src={logo} alt="Supreme" className={styles.logo} />
                        <span className={styles.brandName}>Hospital Entry</span>
                    </div>

                    <nav className={styles.nav}>
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `${styles.navLink} ${isActive ? styles.active : ''}`
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </header>

            <main className={styles.content}>
                <Outlet />
            </main>
        </div>
    );
}
