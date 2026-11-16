// ===============================================================
//   EN MEMORY-BRICKA
//   Baksida (färg + "?") och framsida (vit med emoji).
//   Vänds med en "flip"-animation.
// ===============================================================
import { GameObjects, Geom } from 'phaser';
import { EMOJI_FONT, FONT } from './config.js';

export class Card extends GameObjects.Container
{
    constructor (scene, emoji, level)
    {
        super(scene, 0, 0);

        this.emoji = emoji;
        this.level = level;          // färger kommer från nivån
        this.size = 100;
        this.faceUp = false;
        this.solved = false;

        // "inner" är det som vänds – så att själva brickans position inte påverkas
        this.inner = scene.add.container(0, 0);

        this.gfx  = scene.add.graphics();
        this.mark = scene.add.text(0, 0, level.mark, {
            fontFamily: FONT, fontStyle: '800', color: '#ffffff', padding: { x: 6, y: 6 }
        }).setOrigin(0.5);
        this.face = scene.add.text(0, 0, emoji, {
            fontFamily: EMOJI_FONT, padding: { x: 8, y: 8 }
        }).setOrigin(0.5);

        this.inner.add([this.gfx, this.mark, this.face]);
        this.add(this.inner);
        scene.add.existing(this);

        // Lite liv när man håller musen över en bricka
        this.on('pointerover', () => {
            if (!this.faceUp) this.scene.tweens.add({ targets: this, scale: 1.06, duration: 120 });
        });
        this.on('pointerout', () => {
            this.scene.tweens.add({ targets: this, scale: 1, duration: 120 });
        });

        this.draw();
    }

    // Ändra storlek (görs när skärmen ändrar storlek)
    setCardSize (size)
    {
        this.size = size;
        const hit = new Geom.Rectangle(-size / 2, -size / 2, size, size);
        if (!this.input) {
            this.setInteractive({ hitArea: hit, hitAreaCallback: Geom.Rectangle.Contains, useHandCursor: true });
        } else {
            this.input.hitArea = hit;
        }
        this.draw();
    }

    draw ()
    {
        const s = this.size;
        const r = s * 0.18;                  // rundade hörn
        const h = s / 2;
        const lvl = this.level;
        const g = this.gfx;
        g.clear();

        // Skugga under brickan
        g.fillStyle(0x000000, 0.22);
        g.fillRoundedRect(-h, -h + s * 0.06, s, s, r);

        if (!this.faceUp) {
            // --- BAKSIDA ---
            g.fillStyle(lvl.dark, 1);
            g.fillRoundedRect(-h, -h, s, s, r);
            g.fillStyle(lvl.back, 1);
            g.fillRoundedRect(-h, -h, s, s * 0.93, r);
            // glans
            g.fillStyle(0xffffff, 0.18);
            g.fillRoundedRect(-h + s * 0.08, -h + s * 0.06, s * 0.84, s * 0.3, r * 0.7);
            // prickar i hörnen
            g.fillStyle(0xffffff, 0.35);
            const d = s * 0.3;
            [[-d, -d], [d, -d], [-d, d], [d, d]].forEach(([x, y]) => g.fillCircle(x, y, s * 0.045));
            // vit kant
            g.lineStyle(Math.max(2, s * 0.035), 0xffffff, 0.85);
            g.strokeRoundedRect(-h + s * 0.06, -h + s * 0.06, s * 0.88, s * 0.82, r * 0.7);
        } else {
            // --- FRAMSIDA ---
            const fill   = this.solved ? 0xebfbee : 0xffffff;
            const border = this.solved ? 0xfcc419 : lvl.back;
            g.fillStyle(fill, 1);
            g.fillRoundedRect(-h, -h, s, s, r);
            g.lineStyle(Math.max(3, s * 0.06), border, 1);
            g.strokeRoundedRect(-h + s * 0.03, -h + s * 0.03, s * 0.94, s * 0.94, r * 0.85);
        }

        this.mark.setFontSize(Math.round(s * 0.46)).setY(-s * 0.02).setVisible(!this.faceUp);
        this.mark.setShadow(0, Math.max(1, s * 0.03), 'rgba(0,0,0,0.25)', 0, true, true);
        this.face.setFontSize(Math.round(s * 0.6)).setY(s * 0.02).setVisible(this.faceUp);
    }

    // Vänd brickan med en flip-animation
    flip (faceUp, onDone)
    {
        this.scene.tweens.killTweensOf(this.inner);
        this.inner.setAngle(0).setX(0);
        this.scene.tweens.add({
            targets: this.inner,
            scaleX: 0,
            scaleY: 1.08,
            duration: 110,
            ease: 'Sine.In',
            onComplete: () => {
                this.faceUp = faceUp;
                this.draw();
                this.scene.tweens.add({
                    targets: this.inner,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 140,
                    ease: 'Back.Out',
                    onComplete: () => {
                        this.inner.setScale(1);
                        if (onDone) onDone();
                    }
                });
            }
        });
    }

    // Glatt hopp när brickan är en del av ett par
    celebrate ()
    {
        this.solved = true;
        this.draw();
        this.scene.tweens.killTweensOf(this.inner);
        this.inner.setScale(1).setAngle(0).setX(0);

        this.scene.tweens.add({
            targets: this.inner,
            scaleX: { from: 1, to: 1.22 },
            scaleY: { from: 1, to: 1.22 },
            duration: 200,
            yoyo: true,
            ease: 'Quad.Out',
            onComplete: () => this.inner.setScale(1)
        });
        this.scene.tweens.add({
            targets: this.inner,
            angle: { from: -12, to: 0 },
            duration: 500,
            ease: 'Back.Out'
        });
        // emojin dansar lite
        this.scene.tweens.add({
            targets: this.face,
            angle: { from: -15, to: 15 },
            duration: 160,
            yoyo: true,
            repeat: 2,
            ease: 'Sine.InOut',
            onComplete: () => this.face.setAngle(0)
        });
    }

    // Skaka på huvudet när det inte var ett par
    shake ()
    {
        this.scene.tweens.add({
            targets: this.inner,
            x: { from: -this.size * 0.05, to: this.size * 0.05 },
            duration: 60,
            yoyo: true,
            repeat: 2,
            onComplete: () => this.inner.setX(0)
        });
    }
}
