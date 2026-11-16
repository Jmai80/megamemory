# 🧠 MegaMemory

Ett färgglatt memory-spel med emojis, gjort för barn. Byggt med [Phaser 4](https://phaser.io) och [Vite](https://vitejs.dev) – på samma sätt som memory-spelet i Tuesday-Phaser.

## Så spelar man

Vänd två brickor i taget och hitta alla par! Varje gång du hittar ett par blir det
**konfetti, stjärnor och ett seger-ljud** 🎉. Hittar du flera par i rad får du en bonus-text (”3 i rad! 🔥”).
När alla par är hittade regnar det konfetti och du får 1–3 stjärnor beroende på hur få drag du använde.

| Nivå | Brickor |
|------|---------|
| 🐣 Lätt   | 24 |
| 🦊 Mellan | 36 |
| 🐉 Svår   | Välj själv: 6–100 (med − / + eller reglaget) |

Spelet sparar ditt bästa resultat (tid och antal drag) för varje antal brickor i webbläsaren.
Det fungerar på dator, surfplatta och mobil, och ljudet kan stängas av med 🔊-knappen.

## Kom igång

```bash
npm install
npm run dev        # startar på http://localhost:8080
npm run build      # bygger till mappen dist/
```

## Var finns vad?

| Fil | Vad den gör |
|-----|-------------|
| `src/game/config.js` | **Börja här!** Nivåer, antal brickor, färger, emojis och berömord. |
| `src/game/scenes/MemoryGame.js` | Själva spelet: kortleken, rutnätet och spellogiken. |
| `src/game/Card.js` | En bricka: hur den ritas, vänds och firar. |
| `src/game/effects.js` | Konfetti, fyrverkerier, berömtext och den svävande bakgrunden. |
| `src/game/ui.js` + `index.html` + `src/style.css` | Menyn, räknarna överst och vinstrutan (vanlig HTML/CSS). |
| `public/assets/` | Ljuden. |

## Publicera på GitHub Pages

Workflowen i `.github/workflows/deploy.yml` bygger och publicerar spelet varje gång något pushas till `main`.
Första gången behöver du slå på det i repot: **Settings → Pages → Source: GitHub Actions**.
Spelet hamnar sedan på `https://<ditt-användarnamn>.github.io/megamemory/`.
