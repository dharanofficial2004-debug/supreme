import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import QRCode from 'qrcode';
import config from '../config/config';

const W = 600;
const H = 300;
const DPR = 2;

const COLOR = {
    bg: '#ffffff',
    primary: '#0e7490',    // Teal-ish Cyan 700
    secondary: '#64748b',    // Slate 500
    accent: '#0891b2',    // Cyan 600
    text: '#0f172a',    // Slate 900
    textSub: '#475569',    // Slate 600
    border: '#e2e8f0',
    divider: '#cbd5e1',
};

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let current = '';
    for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        if (ctx.measureText(test).width > maxWidth && current) {
            lines.push(current);
            current = word;
        } else {
            current = test;
        }
    }
    if (current) lines.push(current);
    return lines;
}

export async function drawTicket(canvas, props) {
    const { id, logo } = props;

    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;

    const ctx = canvas.getContext('2d');

    // Reset transform and clear properly to avoid "ghosting" when props change
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply High-DPI scaling safely
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // 1. Background & Border
    ctx.fillStyle = COLOR.bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle Outer Border
    ctx.strokeStyle = COLOR.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(1, 1, W - 2, H - 2);

    // 2. Left Accent Bar
    ctx.fillStyle = COLOR.primary;
    ctx.fillRect(0, 0, 8, H);

    // 3. Header Section (Logo + Org Info)
    // Background for header
    ctx.fillStyle = '#fcfdfe';
    ctx.fillRect(8, 0, W - 8, 70);
    ctx.strokeStyle = COLOR.border;
    ctx.beginPath();
    ctx.moveTo(8, 70);
    ctx.lineTo(W, 70);
    ctx.stroke();

    // Logo (Left side of header)
    if (logo) {
        try {
            const logoImg = await loadImage(logo);
            const aspect = logoImg.width / logoImg.height;
            const lh = 40;
            const lw = lh * aspect;
            ctx.drawImage(logoImg, 28, 15, lw, lh);
        } catch { }
    }

    // Hospital Branding (Right side of header)
    ctx.textAlign = 'right';
    ctx.fillStyle = COLOR.primary;
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText(config.ORG_NAME.toUpperCase(), W - 28, 35);
    ctx.font = '500 10px Inter, sans-serif';
    ctx.fillStyle = COLOR.textSub;
    ctx.fillText(config.TAGLINE, W - 28, 50);

    // 4. Content Area Layout (Left column for info, right for QR)
    const leftColX = 28;
    const rightColX = W - 180;
    const contentY = 100;

    // Vertical Divider
    ctx.strokeStyle = COLOR.divider;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(rightColX - 25, 90);
    ctx.lineTo(rightColX - 25, H - 50);
    ctx.stroke();

    // 5. Left Column: Event Invitation
    ctx.textAlign = 'left';
    ctx.fillStyle = COLOR.text;
    ctx.font = '900 20px Inter, sans-serif';
    ctx.fillText('GRAND LAUNCH INVITATION', leftColX, contentY + 5);

    ctx.fillStyle = COLOR.accent;
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.fillText(config.EVENT_NAME, leftColX, contentY + 28);

    // Info Grid
    ctx.fillStyle = COLOR.text;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText('DATE & TIME', leftColX, contentY + 60);
    ctx.fillText('VENUE', leftColX, contentY + 95);

    ctx.fillStyle = COLOR.textSub;
    ctx.font = '500 11px Inter, sans-serif';
    ctx.fillText(`${config.EVENT_DATE} · ${config.EVENT_TIME}`, leftColX, contentY + 75);

    // Multiple address lines
    const addrLines = wrapText(ctx, `${config.EVENT_VENUE} · ${config.EVENT_ADDRESS}`, 280);
    addrLines.forEach((line, i) => {
        ctx.fillText(line, leftColX, contentY + 110 + i * 14);
    });

    // 6. Right Column: QR Code
    const qrSize = 135;
    const qrX = rightColX - 5;
    const qrY = 95;

    // QR Value
    // QR Value (Encoding only the ID for professional use)
    const qrValue = id;
    try {
        const qrDataUrl = await QRCode.toDataURL(qrValue, {
            margin: 1,
            color: { dark: COLOR.primary, light: '#ffffff' }
        });
        const qrImg = await loadImage(qrDataUrl);
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
    } catch { }

    // ID Label below QR
    ctx.textAlign = 'center';
    ctx.fillStyle = COLOR.primary;
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`ID: ${id}`, qrX + qrSize / 2, qrY + qrSize + 22);

    // 7. Footer Instructions
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(8, H - 40, W - 8, 40);

    ctx.fillStyle = COLOR.primary;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText('PLEASE PRESENT THIS QR AT THE MAIN ENTRANCE FOR SECURE CHECK-IN', 28, H - 15);
}

export async function generateTicketBlob(props) {
    await document.fonts.ready;
    const canvas = document.createElement('canvas');
    await drawTicket(canvas, props);
    return new Promise(r => canvas.toBlob(r, 'image/png'));
}

const TicketCard = forwardRef(function TicketCard(props, ref) {
    const canvasRef = useRef(null);
    const [ready, setReady] = useState(false);

    useImperativeHandle(ref, () => ({
        exportAsPng() { return canvasRef.current.toDataURL('image/png'); },
        getCanvas() { return canvasRef.current; }
    }));

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        setReady(false);
        drawTicket(canvas, props).then(() => setReady(true));
    }, [props.id, props.logo]);

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <canvas ref={canvasRef} style={{ borderRadius: '12px', boxSizing: 'border-box', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            {!ready && (
                <div style={{ position: 'absolute', inset: 0, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
                    Finalizing Pass...
                </div>
            )}
        </div>
    );
});

export default TicketCard;
