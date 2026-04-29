import { useEffect, useState, useMemo } from 'react';
import guests from '../data/guests';
import config from '../config/config';
import styles from './Dashboard.module.css';

const PAGE_SIZE = 10;

export default function Dashboard() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, present, absent
    const [page, setPage] = useState(1);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${config.GAS_URL}?action=getAll`);
            const result = await response.json();
            setData(result || []);
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
            const status = attendance ? (String(attendance.status).toLowerCase() === 'present' || String(attendance.status).toLowerCase() === 'duplicate' ? 'Present' : 'Absent') : 'Absent';
            return {
                id: g.id,
                status: status,
                time: (attendance && status === 'Present') ? attendance.time : '--'
            };
        });
    }, [data]);

    const stats = useMemo(() => {
        const presentCount = mergedData.filter(d => d.status === 'Present').length;
        return { total: guests.length, present: presentCount, absent: guests.length - presentCount };
    }, [mergedData]);

    const filteredData = useMemo(() => {
        let result = mergedData;

        // Filter by Status
        if (statusFilter === 'present') result = result.filter(d => d.status === 'Present');
        if (statusFilter === 'absent') result = result.filter(d => d.status === 'Absent');

        // Filter by Search
        const q = search.trim().toLowerCase();
        if (q) result = result.filter(d => d.id.includes(q));

        return result;
    }, [mergedData, statusFilter, search]);

    const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
    const paginatedData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleFilterChange = (f) => {
        setStatusFilter(f);
        setPage(1);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Guest Entry Log</h1>
                    <p className={styles.subtitle}>{config.EVENT_NAME} · {config.EVENT_DATE}</p>
                </div>
                <button onClick={fetchAllData} className={styles.refreshBtn} disabled={loading}>
                    {loading ? 'Fetching...' : '🔄 Live Update'}
                </button>
            </header>

            <section className={styles.statsGrid}>
                {['Expected', 'Checked In', 'Absent'].map((label, idx) => {
                    const val = idx === 0 ? stats.total : idx === 1 ? stats.present : stats.absent;
                    const color = idx === 0 ? 'var(--primary)' : idx === 1 ? 'var(--success)' : 'var(--danger)';
                    const pct = idx === 0 ? 100 : (val / stats.total) * 100;

                    return (
                        <div key={label} className={styles.statCard}>
                            <span className={styles.statLabel}>{label}</span>
                            {loading && data.length === 0 ? (
                                <div className={styles.skeletonText}></div>
                            ) : (
                                <span className={styles.statValue}>{val}</span>
                            )}
                            <div className={styles.statBar} style={{ width: `${pct}%`, background: color }}></div>
                        </div>
                    );
                })}
            </section>

            <main className={styles.main}>
                <div className={styles.controls}>
                    <div className={styles.searchBox}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            placeholder="Find Pass ID..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className={styles.searchInput}
                        />
                    </div>
                </div>

                <div className={styles.filterTabs}>
                    {['all', 'present', 'absent'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => handleFilterChange(tab)}
                            className={`${styles.filterTab} ${statusFilter === tab ? styles.activeTab : ''}`}
                        >
                            {tab === 'all' ? 'All' : tab === 'present' ? 'Checked In' : 'Absent'}
                        </button>
                    ))}
                </div>

                {error && <div className={styles.errorBanner}>{error}</div>}

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && data.length === 0 ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td><div className={styles.skeletonLine}></div></td>
                                        <td><div className={styles.skeletonLine}></div></td>
                                        <td><div className={styles.skeletonLine}></div></td>
                                        <td><div className={styles.skeletonLine}></div></td>
                                    </tr>
                                ))
                            ) : paginatedData.length > 0 ? (
                                paginatedData.map(row => (
                                    <tr key={row.id}>
                                        <td className={styles.idCell}>#{row.id}</td>
                                        <td className={styles.nameCell}>Guest Pass</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${row.status === 'Present' ? styles.statusPresent : styles.statusAbsent}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className={styles.timeCell}>{row.time}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className={styles.noData}>No records match your filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <button className={styles.pageBtn} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
                        <span className={styles.pageIndicator}>Page {page} of {totalPages}</span>
                        <button className={styles.pageBtn} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
                    </div>
                )}
            </main>
        </div>
    );
}
