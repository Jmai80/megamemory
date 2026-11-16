import { Scene } from 'phaser';
import { Background } from '../effects.js';
import { showMenu, hideMenu } from '../ui.js';

export class MenuScene extends Scene
{
    constructor ()
    {
        super('MenuScene');
    }

    create ()
    {
        this.bg = new Background(this, { floaters: 18, alpha: 0.28 });

        showMenu((levelKey, tiles) => {
            this.scene.start('MemoryGame', { levelKey, tiles });
        });

        const onResize = () => this.bg.build();
        this.scale.on('resize', onResize);
        this.events.once('shutdown', () => {
            this.scale.off('resize', onResize);
            hideMenu();
        });
    }

    update (time, delta)
    {
        this.bg.update(delta);
    }
}
