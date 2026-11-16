// ===============================================================
//   HTML-gränssnittet: meny, HUD (räknare överst) och vinstrutan.
//   Phaser-scenerna anropar funktionerna här.
// ===============================================================
import { LEVELS, HARD_MIN, HARD_MAX } from './config.js';
import { getBest, getSetting, setSetting, formatTime } from './storage.js';

const $ = (id) => document.getElementById(id);

// ---------- Logotypen: varje bokstav i egen färg ----------
const LOGO_COLORS = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa', '#f783ac'];
function buildLogo () {
    const logo = document.querySelector('.logo');
    if (logo.childElementCount) return;
    'MegaMemory'.split('').forEach((ch, i) => {
        const s = document.createElement('span');
        s.textContent = ch;
        s.setAttribute('aria-hidden', 'true');
        s.style.setProperty('--i', i);
        s.style.setProperty('--c', LOGO_COLORS[i % LOGO_COLORS.length]);
        s.style.setProperty('--r', (i % 2 ? -4 : 4) + 'deg');
        logo.appendChild(s);
    });
}

function bestText (tiles) {
    const b = getBest(tiles);
    return b ? `🏆 ${formatTime(b.time)} · ${b.moves} drag` : '';
}

// ---------- MENY ----------
export function showMenu (onStart) {
    buildLogo();
    const menu = $('menu');
    menu.hidden = false;

    const range = $('hard-range');
    range.min = HARD_MIN;
    range.max = HARD_MAX;

    const hardCard = menu.querySelector('[data-level="hard"]');
    let hardTiles = clampHard(getSetting('hardTiles', LEVELS.hard.tiles));

    const refreshHard = () => {
        $('hard-count').textContent = hardTiles;
        range.value = hardTiles;
        hardCard.querySelector('.lv-best').textContent = bestText(hardTiles);
    };

    const setHard = (n) => {
        hardTiles = clampHard(n);
        setSetting('hardTiles', hardTiles);
        refreshHard();
    };

    // Lätt & Mellan: hela kortet är en knapp
    menu.querySelectorAll('button.level').forEach(btn => {
        const key = btn.dataset.level;
        btn.querySelector('.lv-best').textContent = bestText(LEVELS[key].tiles);
        btn.onclick = () => onStart(key, LEVELS[key].tiles);
    });

    // Svår: − / + och reglaget
    menu.querySelectorAll('.step').forEach(b => {
        b.onclick = () => setHard(hardTiles + Number(b.dataset.step));
    });
    range.oninput = () => setHard(Number(range.value));
    $('hard-play').onclick = () => onStart('hard', hardTiles);

    refreshHard();
}

export function hideMenu () {
    $('menu').hidden = true;
}

function clampHard (n) {
    n = Math.round(Number(n) / 2) * 2;               // alltid jämnt antal
    if (!Number.isFinite(n)) n = LEVELS.hard.tiles;
    return Math.max(HARD_MIN, Math.min(HARD_MAX, n));
}

// ---------- LJUD-KNAPPEN ----------
export function setupMuteButton (sound) {
    const btn = $('mute');
    const apply = (muted) => {
        sound.mute = muted;
        btn.textContent = muted ? '🔇' : '🔊';
        btn.setAttribute('aria-pressed', String(muted));
    };
    apply(getSetting('muted', false));
    btn.hidden = false;
    btn.onclick = () => {
        const muted = !sound.mute;
        setSetting('muted', muted);
        apply(muted);
    };
}

// ---------- HUD ----------
export function showHud (onBack) {
    $('hud').hidden = false;
    $('hud-back').onclick = onBack;
}

export function hideHud () {
    $('hud').hidden = true;
}

// Hur långt ner HUD:en når (i CSS-pixlar) – så att brickorna inte hamnar under den
export function hudBottom () {
    const hud = $('hud');
    return hud.hidden ? 0 : hud.getBoundingClientRect().bottom;
}

export function updateHud ({ pairs, totalPairs, moves, seconds }) {
    if (pairs !== undefined) $('hud-pairs').textContent = `${pairs}/${totalPairs}`;
    if (moves !== undefined) $('hud-moves').textContent = moves;
    if (seconds !== undefined) $('hud-time').textContent = formatTime(seconds);
}

export function bumpPairs () {
    const el = $('hud-pairs');
    el.classList.remove('bump');
    void el.offsetWidth;          // starta om animationen
    el.classList.add('bump');
}

// ---------- VINST ----------
export function showWin ({ seconds, moves, stars, record, onAgain, onMenu }) {
    $('win-time').textContent = formatTime(seconds);
    $('win-moves').textContent = moves;
    $('win-record').hidden = !record;

    document.querySelectorAll('#win .stars span').forEach((s, i) => {
        s.classList.toggle('off', i >= stars);
    });

    $('win-again').onclick = onAgain;
    $('win-menu').onclick = onMenu;
    $('win').hidden = false;
}

export function hideWin () {
    $('win').hidden = true;
}
