import './style.css';
import StartGame from './game/main.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Vänta (max 1,5 s) på det runda typsnittet så att texten i spelet ser rätt ut direkt
    try {
        await Promise.race([
            document.fonts.load('800 40px "Baloo 2"'),
            new Promise(r => setTimeout(r, 1500))
        ]);
    } catch (e) { /* inget typsnitt? då kör vi med reservtypsnittet */ }

    StartGame('game-container');
});
