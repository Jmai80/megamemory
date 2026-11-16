// Sparar rekord och inställningar i webbläsaren.
// Allt är inlindat i try/catch – fungerar även i privat läge (då sparas bara inget).
const KEY = 'megamemory-v1';

function readAll () {
    try {
        return JSON.parse(localStorage.getItem(KEY)) || {};
    } catch (e) {
        return {};
    }
}

function writeAll (data) {
    try {
        localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) { /* ignorera */ }
}

export function getSetting (name, fallback) {
    const v = readAll()[name];
    return v === undefined ? fallback : v;
}

export function setSetting (name, value) {
    const data = readAll();
    data[name] = value;
    writeAll(data);
}

// Rekord sparas per antal brickor, t.ex. "best-24"
export function getBest (tiles) {
    return readAll()['best-' + tiles] || null;
}

// Returnerar true om det blev nytt rekord (snabbaste tid eller färst drag)
export function saveResult (tiles, seconds, moves) {
    const data = readAll();
    const key = 'best-' + tiles;
    const old = data[key];
    let record = false;

    if (!old) {
        data[key] = { time: seconds, moves };
    } else {
        const next = { ...old };
        if (seconds < old.time) { next.time = seconds; record = true; }
        if (moves < old.moves)  { next.moves = moves;  record = true; }
        data[key] = next;
    }
    writeAll(data);
    return record;
}

export function formatTime (seconds) {
    const s = Math.floor(seconds);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}
