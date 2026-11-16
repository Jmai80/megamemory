// ===============================================================
//   INSTÄLLNINGAR – här kan du enkelt ändra spelet!
// ===============================================================

// Skärmens pixeltäthet (max 3 för att inte bli för tungt)
export const DPR = Math.min(window.devicePixelRatio || 1, 3);

// Nivåerna. "tiles" = antal brickor (måste vara jämnt).
export const LEVELS = {
    easy:   { name: 'Lätt',   tiles: 24, back: 0x38b6ff, dark: 0x1c7ed6, mark: '?' },
    medium: { name: 'Mellan', tiles: 36, back: 0xff9f43, dark: 0xe8590c, mark: '?' },
    hard:   { name: 'Svår',   tiles: 48, back: 0xb07cff, dark: 0x7048e8, mark: '?' }
};

// Svår nivå: hur många brickor man får välja mellan
export const HARD_MIN = 6;
export const HARD_MAX = 100;

// Alla emojis som kan dyka upp (minst HARD_MAX / 2 st behövs).
// Lägg gärna till egna favoriter!
export const EMOJIS = [
    // djur
    '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵',
    '🐔','🐧','🐤','🦆','🦉','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐢','🐍','🦖',
    '🐙','🦀','🐠','🐬','🐳','🦈','🐊','🦒','🐘','🦔',
    // mat
    '🍎','🍌','🍉','🍇','🍓','🍒','🍍','🥕','🌽','🍕','🍔','🍟','🧁','🍩','🍪',
    '🍭','🍦','🥨',
    // saker & fordon
    '🚗','🚌','🚒','🚓','🚀','✈️','🚁','⛵','🚂','🚲','⚽','🏀','🎈','🎁','🎨',
    '🎸','🥁','🧸','👑','🎩',
    // natur
    '☀️','🌙','⭐','🌈','❄️','🔥','🌸','🌻','🍄','🌵'
];

// Beröm som poppar upp när man hittar ett par
export const PRAISE = ['Snyggt!', 'Bra!', 'Wow!', 'Super!', 'Toppen!', 'Grymt!', 'Jaa!', 'Kanon!', 'Häftigt!'];

// Konfettifärger
export const CONFETTI_COLORS = [0xff6b6b, 0xffd43b, 0x51cf66, 0x339af0, 0xcc5de8, 0xff922b, 0x22b8cf, 0xf06595];

// Typsnitt
export const FONT = '"Baloo 2", "Arial Rounded MT Bold", "Trebuchet MS", sans-serif';
export const EMOJI_FONT = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Twemoji Mozilla", sans-serif';
