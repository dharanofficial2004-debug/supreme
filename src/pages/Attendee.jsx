import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import config from '../config/config';
import styles from './Attendee.module.css';

export default function Attendee() {
    const [stage, setStage] = useState('idle'); // idle, checking, identified, duplicate, processing, success, error
    const [currentId, setCurrentId] = useState(null);
    const [result, setResult] = useState(null);
    const [scanCount, setScanCount] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const html5QrCodeRef = useRef(null);
    const isLockedRef = useRef(false);

    const fetchLiveCount = useCallback(async () => {
        try {
            const response = await fetch(`${config.GAS_URL}?action=getAll`);
            const data = await response.json();
            const presentCount = data.filter(d => ['present', 'duplicate', 'success'].includes(String(d.status).toLowerCase().trim())).length;
            setScanCount(presentCount);
        } catch (err) { }
    }, []);

    useEffect(() => {
        fetchLiveCount();
    }, [fetchLiveCount]);

    const resetScanner = () => {
        isLockedRef.current = false;
        setStage('idle');
        setCurrentId(null);
        setResult(null);
    };

    const stopCamera = async () => {
        if (html5QrCodeRef.current?.isScanning) {
            await html5QrCodeRef.current.stop();
            setIsActive(false);
        }
    };

    const startCamera = async () => {
        setErrorMsg(null);
        await stopCamera();
        try {
            if (!html5QrCodeRef.current) html5QrCodeRef.current = new Html5Qrcode("qr-reader");
            await html5QrCodeRef.current.start(
                { facingMode: "environment" },
                { fps: 15, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
                (t) => { if (!isLockedRef.current) handleScan(t); },
                () => { }
            );
            setIsActive(true);
        } catch (err) { setErrorMsg("Camera access denied."); }
    };

    const handleScan = async (decodedText) => {
        if (isLockedRef.current) return;

        let id = decodedText;
        if (decodedText.includes('id=')) {
            const urlParams = new URLSearchParams(decodedText.split('?')[1]);
            id = urlParams.get('id');
        }
        id = String(id || '').trim().padStart(3, '0');
        const numericId = parseInt(id, 10);
        if (isNaN(numericId) || numericId < 1 || numericId > 200) return;

        isLockedRef.current = true;
        setCurrentId(id);
        setStage('checking');

        try {
            const checkResp = await fetch(`${config.GAS_URL}?id=${id}&check=true`);
            const checkData = await checkResp.json();
            const status = String(checkData.status || '').toLowerCase().trim();

            if (status === 'present' || status === 'duplicate') {
                setResult({ time: checkData.time });
                setStage('duplicate');
            } else {
                setStage('identified');
            }
        } catch (e) {
            setStage('error');
        }
    };

    const handleMarkPresent = async () => {
        if (!currentId) return;
        setStage('processing');

        try {
            const response = await fetch(`${config.GAS_URL}?id=${currentId}`);
            const data = await response.json();
            if (data.status === 'success' || data.status === 'duplicate') {
                setStage('success');
                fetchLiveCount();
            } else {
                setStage('error');
            }
        } catch (e) {
            setStage('error');
        }
    };

    useEffect(() => { return () => { stopCamera(); }; }, []);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerTop}>
                    <h1 className={styles.title}>Supreme Gate</h1>
                    <div className={styles.liveBadge}><span className={styles.dot}></span> LIVE</div>
                </div>
                <div className={styles.stats}>
                    <div className={styles.statCard}>
                        <span className={styles.statVal}>{scanCount}</span>
                        <span className={styles.statLabel}>Guests In</span>
                    </div>
                    <button onClick={isActive ? stopCamera : startCamera} className={`${styles.powerBtn} ${isActive ? styles.active : ''}`}>
                        {isActive ? 'Stop' : 'Start'}
                    </button>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.scannerWrapper}>
                    <div id="qr-reader" className={styles.reader} style={{ visibility: isActive ? 'visible' : 'hidden', position: 'absolute', inset: 0 }}></div>

                    {!isActive && !errorMsg && (
                        <div className={styles.placeholder}>
                            <div className={styles.heartPulse}>🏥</div>
                            <h2>Scanner Ready</h2>
                            <p>Activate terminal to verify guest entry</p>
                            <button onClick={startCamera} className={styles.pulseBtn}>ENABLE SCANNER</button>
                        </div>
                    )}

                    {isActive && stage === 'idle' && (
                        <div className={styles.scannerOverlay}>
                            <div className={styles.guideBox}></div>
                            <p className={styles.guideText}>Align Guest Pass QR</p>
                        </div>
                    )}

                    {/* Simple Centered Overlay */}
                    {stage !== 'idle' && (
                        <div className={styles.resultOverlay}>
                            <div className={styles.resultCard}>
                                {stage === 'checking' && (
                                    <div className={styles.statusBox}>
                                        <div className={styles.loadingPulse}></div>
                                        <h3>Identifying...</h3>
                                        <p>Guest Pass #{currentId}</p>
                                    </div>
                                )}
                                {stage === 'identified' && (
                                    <div className={styles.statusBox}>
                                        <div className={styles.idCircle}>#{currentId}</div>
                                        <h3>Guest Verified</h3>
                                        <p>Ready to record entry for this pass.</p>
                                        <div className={styles.actionArea}>
                                            <button className={styles.primaryAction} onClick={handleMarkPresent}>CONFIRM ENTRANCE</button>
                                            <button className={styles.secondaryAction} onClick={resetScanner}>Cancel / Scan New</button>
                                        </div>
                                    </div>
                                )}
                                {stage === 'duplicate' && (
                                    <div className={styles.statusBox}>
                                        <div className={`${styles.idCircle} ${styles.warning}`}>#{currentId}</div>
                                        <h3 className={styles.warningText}>Already In</h3>
                                        <p>This guest entered at:<br /><b>{result?.time || 'N/A'}</b></p>
                                        <div className={styles.actionArea}>
                                            <button className={`${styles.primaryAction} ${styles.danger}`} onClick={resetScanner}>SCAN NEXT</button>
                                        </div>
                                    </div>
                                )}
                                {stage === 'processing' && (
                                    <div className={styles.statusBox}>
                                        <div className={styles.loadingPulse} style={{ background: '#10b981' }}></div>
                                        <h3>Updating...</h3>
                                        <p>Saving timestamp to records</p>
                                    </div>
                                )}
                                {stage === 'success' && (
                                    <div className={styles.statusBox}>
                                        <div className={styles.successIcon}>✅</div>
                                        <h3 className={styles.successText}>Entry Recorded</h3>
                                        <p>Welcome, Guest #{currentId}!</p>
                                        <div className={styles.actionArea}>
                                            <button className={styles.primaryAction} onClick={resetScanner} style={{ background: '#10b981' }}>NEXT GUEST</button>
                                        </div>
                                    </div>
                                )}
                                {stage === 'error' && (
                                    <div className={styles.statusBox}>
                                        <div className={styles.errorIcon}>❌</div>
                                        <h3>Sync Failed</h3>
                                        <p>Connection issue. ID was not recorded.</p>
                                        <div className={styles.actionArea}>
                                            <button className={styles.primaryAction} onClick={resetScanner}>TRY AGAIN</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
