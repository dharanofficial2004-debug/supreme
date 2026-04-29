// src/config/config.js
// ─────────────────────────────────────────────────────────────
// Central configuration for Supreme Multispeciality Hospital Launch
// ─────────────────────────────────────────────────────────────

const config = {
    // ── Google Apps Script Web App URL ──────────────────────────
    GAS_URL: 'https://script.google.com/macros/s/AKfycbxytM20RfNCBZ9MQXAgAnOGAK6igdkATovI1niwVC_TkfL1xn14BxActcRP9WC2g3oS/exec',

    // ── Event Details ────────────────────────────────────────────
    EVENT_NAME: 'New Wing Grand Launch',
    EVENT_DATE: '15 May 2026',
    EVENT_TIME: '10:30 AM IST',
    EVENT_VENUE: 'Main Atrium, Supreme Hospital',
    EVENT_ADDRESS: '123 Healthcare Blvd, Medical District, Kolkata',

    // ── Institution Details ──────────────────────────────────────
    ORG_NAME: 'Supreme Multispeciality Hospital',
    ORG_SHORT: 'Supreme Hospital',
    TAGLINE: 'Care Beyond Compare · Excellence in Healthcare',

    // ── Logo ─────────────────────────────────────────────────────
    LOGO_FILENAME: 'supreme_logo.webp',

    // ── QR Code generation settings ─────────────────────────────
    QR_BASE_URL: 'https://script.google.com/macros/s/AKfycbxytM20RfNCBZ9MQXAgAnOGAK6igdkATovI1niwVC_TkfL1xn14BxActcRP9WC2g3oS/exec?id=',

    // ── PDF / Export settings ────────────────────────────────────
    PDF_TITLE: 'Guest Entry Pass',
    PDF_AUTHOR: 'Supreme Hospital Event Team',
};

export default config;
