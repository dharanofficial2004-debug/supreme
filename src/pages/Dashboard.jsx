import { useEffect, useState, useMemo } from 'react';
import guests from '../data/guests';
import config from '../config/config';
import styles from './Dashboard.module.css';

export default function Dashboard() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${config.GAS_URL}?action=getAll`);
            const result = await response.json();
            setData(result);
            setError(null);
        } catch (err) {
            setError('Connection with Google Sheets lost.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
        const interval = setInterval(fetchAllData, 30000);
        return () => clearInterval(interval);
    }, []);

    const mergedData = useMemo(() => {
        const sheetMap = new Map(data.map(item => [item.id, item]));
        return guests.map(g => {
            const attendance = sheetMap.get(g.id);
            return {
                id: g.id,
                status: attendance ? attendance.status : 'Absent',
                time: attendance ? attendance.time : '--'
            };
        });
    }, [data]);

    const stats = useMemo(() => {
        const present = mergedData.filter(d => d.status.toLowerCase() === 'present').length;
        return { total: guests.length, present, absent: guests.length - present };
    }, [mergedData]);

    const filteredData = useMemo(() => {
        const q = search.trim();
        if (!q) return mergedData;
        return mergedData.filter(d => d.id.includes(q));
    }, [mergedData, search]);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div><h1 className={styles.title}>Guest Entry Log</h1><p className={styles.subtitle}>{config.EVENT_NAME} · {config.EVENT_DATE}</p></div>
                <div className={styles.headerActions}>
                    <button onClick={fetchAllData} className={styles.refreshBtn} disabled={loading}>{loading ? 'Refreshing...' : '🔄 Live Update'}</button>
                </div>
            </header>

            <section className={styles.statsGrid}>
                <div className={styles.statCard}><span className={styles.statLabel}>Expected Guests</span><span className={styles.statValue}>{stats.total}</span><div className={styles.statBar} style={{ width: '100%', background: 'var(--primary)' }}></div></div>
                <div className={`${styles.statCard} ${styles.presentCard}`}><span className={styles.statLabel}>Checked In</span><span className={styles.statValue}>{stats.present}</span><div className={styles.statBar} style={{ width: `${(stats.present / stats.total) * 100}%`, background: 'var(--success)' }}></div></div>
                <div className={`${styles.statCard} ${styles.absentCard}`}><span className={styles.statLabel}>Waiting</span><span className={styles.statValue}>{stats.absent}</span><div className={styles.statBar} style={{ width: `${(stats.absent / stats.total) * 100}%`, background: 'var(--danger)' }}></div></div>
            </section>

            <main className={styles.main}>
                <div className={styles.filters}>
                    <div className={styles.searchBox}><span className={styles.searchIcon}>🔍</span><input type="text" placeholder="Filter by Pass ID..." value={search} onChange={(e) => setSearch(e.target.value)} className={styles.searchInput} /></div>
                </div>
                {error && <div className={styles.errorBanner}>{error}</div>}
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead><tr><th>ID</th><th>Invite Type</th><th>Entry Status</th><th>Check-in Time</th></tr></thead>
                        <tbody>
                            {filteredData.map(row => (
                                <tr key={row.id}><td className={styles.idCell}>{row.id}</td><td className={styles.nameCell}>Standard Invite</td><td><span className={`${styles.statusBadge} ${row.status.toLowerCase() === 'present' ? styles.statusPresent : styles.statusAbsent}`}>{row.status}</span></td><td className={styles.timeCell}>{row.time}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
