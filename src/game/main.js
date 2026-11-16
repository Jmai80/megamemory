import { AUTO, Game, Scale } from 'phaser';
import { Preloader } from './scenes/Preloader.js';
import { MenuScene } from './scenes/MenuScene.js';
import { MemoryGame } from './scenes/MemoryGame.js';
import { DPR } from './config.js';

// ---------------------------------------------------------------
//  Spelet fyller hela fönstret. Canvasen ritas med skärmens
//  pixeltäthet (DPR) så att emojis och text blir skarpa även på
//  mobiler och surfplattor. "zoom" krymper sedan tillbaka den
//  till rätt storlek på skärmen.
// ---------------------------------------------------------------
const viewSize = () => ({
    w: Math.round(window.innerWidth  * DPR),
    h: Math.round(window.innerHeight * DPR)
});

const StartGame = (parent) => {
    const { w, h } = viewSize();

    const game = new Game({
        type: AUTO,
        parent,
        width: w,
        height: h,
        backgroundColor: '#2b1d5c',
        scale: {
            mode: Scale.NONE,
            zoom: 1 / DPR
        },
        scene: [Preloader, MenuScene, MemoryGame]
    });

    let timer = null;
    const onResize = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            const s = viewSize();
            game.scale.resize(s.w, s.h);
        }, 60);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    // Gör spelet åtkomligt i konsolen under utveckling (bra för felsökning)
    if (import.meta.env.DEV) window.__game = game;

    return game;
};

export default StartGame;
