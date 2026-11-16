import { Scene } from 'phaser';
import { makeTextures } from '../effects.js';
import { setupMuteButton } from '../ui.js';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    preload ()
    {
        this.load.setPath('assets');
        this.load.audio('pair', 'correct.mp3');   // seger-ljud för ett par
        this.load.audio('win',  'yay.mp3');       // när alla par är hittade
        this.load.audio('win2', 'funnyYay.mp3');
        this.load.audio('flip', 'pop.mp3');       // när man vänder en bricka
    }

    create ()
    {
        makeTextures(this);
        setupMuteButton(this.sound);
        this.scene.start('MenuScene');
    }
}
