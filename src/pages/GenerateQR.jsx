import { useRef, useState, useMemo, useCallback } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import TicketCard, { generateTicketBlob } from '../components/TicketCard';
import guests from '../data/guests';
import config from '../config/config';
import styles from './GenerateQR.module.css';

const PAGE_SIZE = 6;
import logo from '../assets/supreme_logo.webp'; // Update in src/assets/hospital-logo.png if needed

function safeFilename(guest) {
    return `Pass_${guest.id}.png`;
}

function ticketProps(guest) {
    return {
        id: guest.id,
        logo,
    };
}

export default function GenerateQR() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [zipError, setZipError] = useState(null);
    const [zipDone, setZipDone] = useState(false);
    const abortRef = useRef(false);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return guests;
        return guests.filter((g) => g.id.includes(q));
    }, [search]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const pageGuests = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleDownloadAll = useCallback(async () => {
        setIsGenerating(true);
        setProgress(0);
        setZipError(null);
        setZipDone(false);
        abortRef.current = false;
        const zip = new JSZip();

        try {
            for (let i = 0; i < guests.length; i++) {
                if (abortRef.current) break;
                const guest = guests[i];
                const blob = await generateTicketBlob(ticketProps(guest));
                zip.file(safeFilename(guest), blob);
                setProgress(i + 1);
            }

            if (!abortRef.current) {
                const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
                saveAs(zipBlob, `Supreme_Hospital_Launch_Passes.zip`);
                setZipDone(true);
            }
        } catch (err) {
            setZipError(err.message);
        } finally {
            setIsGenerating(false);
        }
    }, []);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>Guest Entry Passes</h1>
                    <p className={styles.subtitle}>{guests.length} Passes · {config.EVENT_NAME}</p>
                </div>
                <button className={styles.downloadBtn} onClick={handleDownloadAll} disabled={isGenerating}>
                    {isGenerating ? '⌛ Generating...' : '⬇ Download 200 Passes ZIP'}
                </button>
            </div>

            {isGenerating && (
                <div className={styles.progressBox}>
                    <div className={styles.progressHeader}>
                        <span className={styles.progressLabel}>Generating pass {progress} of {guests.length}</span>
                        <button className={styles.cancelBtn} onClick={() => abortRef.current = true}>Cancel</button>
                    </div>
                    <div className={styles.progressTrack}><div className={styles.progressFill} style={{ width: `${(progress / guests.length) * 100}%` }} /></div>
                </div>
            )}

            {zipDone && !isGenerating && <div className={`${styles.banner} ${styles.bannerSuccess}`}>✅ All 200 passes bundled successfully!</div>}
            {zipError && <div className={`${styles.banner} ${styles.bannerError}`}>⚠ Export failed: {zipError}</div>}

            <div className={styles.controls}>
                <div className={styles.searchWrap}>
                    <span className={styles.searchIcon}>🔍</span>
                    <input type="text" placeholder="Search by ID..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className={styles.searchInput} />
                </div>
                <span className={styles.resultCount}>{filtered.length} Entry Passes</span>
            </div>

            <div className={styles.grid}>
                {pageGuests.map((guest) => (
                    <div key={guest.id} className={styles.cardWrap}>
                        <div className={styles.cardMeta}><span className={styles.cardId}>GUEST ID: {guest.id}</span></div>
                        <div className={styles.cardScaler}><TicketCard {...ticketProps(guest)} /></div>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button className={styles.pageBtn} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
                    <span className={styles.pageIndicator}>Page {page} of {totalPages}</span>
                    <button className={styles.pageBtn} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
                </div>
            )}
        </div>
    );
}
