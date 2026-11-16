import { Scene } from 'phaser';
import { Card } from '../Card.js';
import { LEVELS, EMOJIS, DPR } from '../config.js';
import { Background, confettiBurst, confettiRain, praise } from '../effects.js';
import * as ui from '../ui.js';
import { saveResult } from '../storage.js';

export class MemoryGame extends Scene
{
    constructor ()
    {
        super('MemoryGame');
    }

    init (data)
    {
        this.levelKey = data.levelKey || 'easy';
        this.level = LEVELS[this.levelKey];
        this.tiles = data.tiles || this.level.tiles;
    }

    create ()
    {
        // --- Tillstånd ---
        this.totalPairs = this.tiles / 2;
        this.pairsFound = 0;
        this.moves = 0;          // ett drag = två vända brickor
        this.streak = 0;         // par i rad
        this.firstCard = null;
        this.mismatch = null;    // ett fel par som väntar på att vändas tillbaka
        this.startTime = null;
        this.finished = false;

        this.bg = new Background(this, { floaters: 10, alpha: 0.12 });

        ui.showHud(() => this.scene.start('MenuScene'));
        ui.updateHud({ pairs: 0, totalPairs: this.totalPairs, moves: 0, seconds: 0 });

        // --- Kortlek: slumpa fram emojis, lägg varje två gånger och blanda ---
        const symbols = shuffle([...EMOJIS]).slice(0, this.totalPairs);
        const deck = shuffle([...symbols, ...symbols]);

        this.cards = deck.map(emoji => {
            const card = new Card(this, emoji, this.level);
            card.on('pointerdown', () => this.handleCardClick(card));
            return card;
        });

        this.layout();

        // Brickorna poppar in en och en
        const step = Math.min(25, 700 / this.cards.length);
        this.cards.forEach((card, i) => {
            card.setScale(0);
            this.tweens.add({ targets: card, scale: 1, delay: 100 + i * step, duration: 320, ease: 'Back.Out' });
        });

        // --- Om fönstret ändrar storlek: lägg om rutnätet ---
        const onResize = () => { this.bg.build(); this.layout(); };
        this.scale.on('resize', onResize);
        this.events.once('shutdown', () => {
            this.scale.off('resize', onResize);
            ui.hideHud();
            ui.hideWin();
        });
    }

    // =================================================================
    //   RUTNÄTET – räknar ut hur många kolumner som ger störst brickor
    // =================================================================
    layout ()
    {
        const W = this.scale.width;
        const H = this.scale.height;
        const pad = 12 * DPR;
        const top = ui.hudBottom() * DPR + pad;
        const areaW = W - pad * 2;
        const areaH = H - top - pad;
        const GAP = 0.12;                       // mellanrum = 12 % av brickan

        const n = this.cards.length;
        let best = { size: 0, cols: 1, rows: n };
        for (let cols = 1; cols <= n; cols++) {
            const rows = Math.ceil(n / cols);
            const size = Math.min(
                areaW / (cols + (cols - 1) * GAP),
                areaH / (rows + (rows - 1) * GAP)
            );
            // större brickor vinner; vid lika – färre tomma platser
            const empty = rows * cols - n;
            if (size > best.size + 0.5 || (Math.abs(size - best.size) <= 0.5 && empty < best.empty)) {
                best = { size, cols, rows, empty };
            }
        }

        const size = Math.min(best.size, 190 * DPR);
        const gap = size * GAP;
        const cell = size + gap;
        const gridH = best.rows * cell - gap;
        const startY = top + (areaH - gridH) / 2 + size / 2;

        this.cards.forEach((card, i) => {
            const row = Math.floor(i / best.cols);
            const col = i % best.cols;
            // sista raden centreras om den inte är full
            const inRow = row === best.rows - 1 ? n - row * best.cols : best.cols;
            const rowW = inRow * cell - gap;
            const startX = (W - rowW) / 2 + size / 2;
            card.setPosition(startX + col * cell, startY + row * cell);
            card.setCardSize(size);
        });
    }

    // =================================================================
    //   SPELLOGIKEN
    // =================================================================
    handleCardClick (card)
    {
        if (this.finished || card.solved) return;

        // Visas ett fel par just nu? Ett nytt tryck vänder tillbaka dem direkt
        // (så att ivriga fingrar inte behöver vänta).
        // Trycker man på en av de två får den ligga kvar uppvänd som nytt första kort.
        if (this.mismatch) {
            const keep = this.mismatch.cards.includes(card) ? card : null;
            this.resolveMismatch(keep);
            if (keep) {
                this.firstCard = keep;
                return;
            }
        }
        if (card.faceUp) return;
        if (this.startTime === null) this.startTime = this.time.now;

        this.sound.play('flip', { volume: 0.5 });

        if (!this.firstCard) {
            this.firstCard = card;
            card.flip(true);
            return;
        }

        const a = this.firstCard;
        const b = card;
        this.firstCard = null;
        this.moves++;
        ui.updateHud({ moves: this.moves });

        if (a.emoji === b.emoji) {
            // ---- ETT PAR! Fira när andra brickan har vänt klart ----
            a.solved = b.solved = true;
            this.pairsFound++;
            this.streak++;
            b.flip(true, () => this.celebratePair(a, b));
        } else {
            // ---- Inte ett par: vänd tillbaka efter en stund ----
            b.flip(true);
            this.streak = 0;
            this.mismatch = {
                cards: [a, b],
                timers: [
                    this.time.delayedCall(800,  () => { a.shake(); b.shake(); }),
                    this.time.delayedCall(1300, () => this.resolveMismatch())
                ]
            };
        }
    }

    resolveMismatch (keep = null)
    {
        if (!this.mismatch) return;
        this.mismatch.timers.forEach(t => t.remove(false));
        this.mismatch.cards.forEach(c => { if (c !== keep) c.flip(false); });
        this.mismatch = null;
    }

    celebratePair (a, b)
    {
        this.sound.play('pair', { volume: 0.8 });

        a.celebrate();
        b.celebrate();
        a.setDepth(5);
        b.setDepth(5);

        const amount = this.cards.length > 60 ? 24 : 36;
        confettiBurst(this, a.x, a.y, amount);
        confettiBurst(this, b.x, b.y, amount);

        praise(this, (a.x + b.x) / 2, (a.y + b.y) / 2 - a.size * 0.3, this.streak);

        ui.updateHud({ pairs: this.pairsFound, totalPairs: this.totalPairs });
        ui.bumpPairs();

        if (this.pairsFound === this.totalPairs) this.win();
    }

    win ()
    {
        this.finished = true;
        const seconds = (this.time.now - this.startTime) / 1000;
        ui.updateHud({ seconds });

        // Stjärnor: färre drag = fler stjärnor (perfekt = lika många drag som par)
        const ratio = this.moves / this.totalPairs;
        const stars = ratio <= 2 ? 3 : ratio <= 3 ? 2 : 1;
        const record = saveResult(this.tiles, seconds, this.moves);

        this.time.delayedCall(700, () => {
            this.sound.play('win');
            this.time.delayedCall(900, () => this.sound.play('win2', { volume: 0.7 }));
            confettiRain(this);

            // Alla brickor gör en liten våg
            this.cards.forEach((c, i) => {
                this.tweens.add({
                    targets: c, y: c.y - c.size * 0.25, delay: i * 20,
                    duration: 200, yoyo: true, ease: 'Sine.Out'
                });
            });
        });

        this.time.delayedCall(2300, () => {
            ui.showWin({
                seconds,
                moves: this.moves,
                stars,
                record,
                onAgain: () => this.scene.restart({ levelKey: this.levelKey, tiles: this.tiles }),
                onMenu: () => this.scene.start('MenuScene')
            });
        });
    }

    update (time, delta)
    {
        this.bg.update(delta);
        if (this.startTime !== null && !this.finished) {
            ui.updateHud({ seconds: (time - this.startTime) / 1000 });
        }
    }
}

function shuffle (array)
{
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
