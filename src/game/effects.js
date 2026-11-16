// ===============================================================
//   EFFEKTER: konfetti, stjärnregn, berömtext och bakgrund
// ===============================================================
import { CONFETTI_COLORS, PRAISE, FONT, EMOJI_FONT, DPR } from './config.js';

// En "enhet" som gör att saker får lagom storlek på både mobil och dator
export function unit (scene) {
    const cssMin = Math.min(scene.scale.width, scene.scale.height) / DPR;
    return DPR * Math.max(0.7, Math.min(1.3, cssMin / 650));
}

// Skapar de små bilderna som konfettin består av (görs en gång)
export function makeTextures (scene) {
    if (scene.textures.exists('confetti')) return;

    const g = scene.add.graphics();

    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 16, 9);
    g.generateTexture('confetti', 16, 9);
    g.clear();

    g.fillStyle(0xffffff, 1);
    g.fillCircle(7, 7, 7);
    g.generateTexture('dot', 14, 14);
    g.clear();

    // En liten femuddig stjärna
    const pts = [];
    for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? 12 : 5;
        const a = -Math.PI / 2 + i * Math.PI / 5;
        pts.push({ x: 12 + Math.cos(a) * r, y: 12 + Math.sin(a) * r });
    }
    g.fillStyle(0xffffff, 1);
    g.fillPoints(pts, true);
    g.generateTexture('star', 24, 24);

    g.destroy();
}

// Konfetti som snurrar och fladdrar när den faller
const spin = {
    onEmit: () => Math.random() * 360,
    onUpdate: (p, key, t, value) => value + 6
};
const flutter = {
    onEmit: () => 1,
    onUpdate: (p) => Math.cos((p.lifeCurrent + p.x) * 0.012)
};

// ---- Konfetti-explosion (när man hittar ett par) ----
export function confettiBurst (scene, x, y, amount = 36) {
    const u = unit(scene);

    const confetti = scene.add.particles(x, y, 'confetti', {
        speed: { min: 260 * u, max: 620 * u },
        angle: { min: 200, max: 340 },        // mest uppåt
        gravityY: 900 * u,
        lifespan: { min: 900, max: 1500 },
        scaleX: { start: 1.1 * u, end: 0.7 * u },
        scaleY: flutter,
        rotate: spin,
        alpha: { start: 1, end: 0, ease: 'Quad.In' },
        tint: CONFETTI_COLORS,
        emitting: false
    }).setDepth(50);
    confetti.explode(amount);

    const stars = scene.add.particles(x, y, 'star', {
        speed: { min: 120 * u, max: 320 * u },
        angle: { min: 0, max: 360 },
        lifespan: 700,
        scale: { start: 0.9 * u, end: 0 },
        rotate: spin,
        tint: [0xffd43b, 0xffffff, 0xfff3bf],
        emitting: false
    }).setDepth(51);
    stars.explode(10);

    scene.time.delayedCall(1700, () => {
        confetti.destroy();
        stars.destroy();
    });
}

// ---- Konfettiregn över hela skärmen (när man vinner) ----
export function confettiRain (scene, duration = 3500) {
    const u = unit(scene);
    const w = scene.scale.width;

    const rain = scene.add.particles(0, -30 * u, 'confetti', {
        x: { min: 0, max: w },
        speedY: { min: 220 * u, max: 480 * u },
        speedX: { min: -90 * u, max: 90 * u },
        gravityY: 120 * u,
        lifespan: 6000,
        scaleX: { min: 1.0 * u, max: 1.5 * u },
        scaleY: flutter,
        rotate: spin,
        tint: CONFETTI_COLORS,
        frequency: 12,
        quantity: 2
    }).setDepth(60);

    scene.time.delayedCall(duration, () => rain.stop());
    scene.time.delayedCall(duration + 6500, () => rain.destroy());

    // Några fyrverkerier också
    for (let i = 0; i < 7; i++) {
        scene.time.delayedCall(250 + i * 380, () => {
            const fx = scene.scale.width * (0.15 + Math.random() * 0.7);
            const fy = scene.scale.height * (0.15 + Math.random() * 0.45);
            firework(scene, fx, fy);
        });
    }
}

export function firework (scene, x, y) {
    const u = unit(scene);
    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    const fw = scene.add.particles(x, y, 'dot', {
        speed: { min: 100 * u, max: 340 * u },
        angle: { min: 0, max: 360 },
        gravityY: 260 * u,
        lifespan: 900,
        scale: { start: 0.9 * u, end: 0 },
        alpha: { start: 1, end: 0 },
        tint: [color, 0xffffff],
        emitting: false
    }).setDepth(55);
    fw.explode(40);
    scene.time.delayedCall(1100, () => fw.destroy());
}

// ---- Berömtext som studsar fram och flyger iväg ----
export function praise (scene, x, y, streak) {
    const u = unit(scene);
    const word = streak >= 2 ? `${streak} i rad! 🔥` : PRAISE[Math.floor(Math.random() * PRAISE.length)];
    const size = Math.round((streak >= 2 ? 46 : 54) * u);

    const t = scene.add.text(x, y, word, {
        fontFamily: `${FONT}, ${EMOJI_FONT}`,
        fontSize: size + 'px',
        fontStyle: '800',
        color: '#ffffff',
        stroke: '#7048e8',
        strokeThickness: Math.round(size * 0.16),
        padding: { x: 10, y: 10 }
    }).setOrigin(0.5).setDepth(70).setScale(0).setAngle(-8 + Math.random() * 16);

    // Håll texten innanför skärmen
    const half = t.width / 2 + 8 * u;
    t.x = Math.max(half, Math.min(scene.scale.width - half, x));

    t.setShadow(0, 4 * u, 'rgba(0,0,0,0.3)', 0, true, true);

    scene.tweens.add({ targets: t, scale: 1, duration: 320, ease: 'Back.Out' });
    scene.tweens.add({
        targets: t,
        y: y - 90 * u,
        alpha: 0,
        delay: 650,
        duration: 550,
        ease: 'Quad.In',
        onComplete: () => t.destroy()
    });
}

// ===============================================================
//   BAKGRUND: mjuk färgtoning + emojis som sakta svävar uppåt
// ===============================================================
const BG_EMOJIS = ['🎈', '⭐', '🌈', '🦄', '🐠', '🍭', '🚀', '🌸', '🐣', '🍓', '🦋', '🎁'];

export class Background {
    constructor (scene, { floaters = 14, alpha = 0.18 } = {}) {
        this.scene = scene;
        this.gfx = scene.add.graphics().setDepth(-10);
        this.floaters = [];
        this.count = floaters;
        this.alpha = alpha;
        this.build();
    }

    build () {
        const { width: w, height: h } = this.scene.scale;
        const u = unit(this.scene);

        this.gfx.clear();
        this.gfx.fillGradientStyle(0x3b2a8a, 0x3b2a8a, 0x8a3fb0, 0xd2558a, 1);
        this.gfx.fillRect(0, 0, w, h);

        this.floaters.forEach(f => f.destroy());
        this.floaters = [];

        for (let i = 0; i < this.count; i++) {
            const size = Math.round((40 + Math.random() * 50) * u);
            const t = this.scene.add.text(
                Math.random() * w,
                Math.random() * h,
                BG_EMOJIS[i % BG_EMOJIS.length],
                { fontFamily: EMOJI_FONT, fontSize: size + 'px', padding: { x: size * 0.3, y: size * 0.3 } }
            ).setOrigin(0.5).setAlpha(this.alpha).setDepth(-9);
            t.speed = (12 + Math.random() * 22) * u;     // pixlar per sekund
            t.sway = Math.random() * Math.PI * 2;
            t.baseX = t.x;
            this.floaters.push(t);
        }
    }

    update (delta) {
        const { width: w, height: h } = this.scene.scale;
        const dt = delta / 1000;
        for (const t of this.floaters) {
            t.y -= t.speed * dt;
            t.sway += dt * 0.8;
            t.x = t.baseX + Math.sin(t.sway) * 18 * DPR;
            t.angle = Math.sin(t.sway) * 10;
            if (t.y < -t.height) {
                t.y = h + t.height;
                t.baseX = Math.random() * w;
            }
        }
    }
}
