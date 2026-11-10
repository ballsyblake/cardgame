# FutsalMe

A futsal card game that runs entirely in the browser. Open packs, build a
five-a-side team, pick a referee and play simulated matches for coins.

- No server, database or login. Progress is saved on the device (`localStorage`).
- No build step: three files, `index.html`, `app.css`, `app.js`.
- All players, referees and clubs are made up.

## Run it

Open `index.html` in a browser, or serve the folder:

```sh
python -m http.server 8000   # then open http://localhost:8000
```

Pushing to `main` publishes it to GitHub Pages (`.github/workflows/pages.yml`).
Pages must be switched on once: Settings > Pages > Source: GitHub Actions.

## Tuning the game

The rules are constants at the top of `app.js`: pack prices and odds, match
length, coin rewards and how likely each match event is.

## Old version

`legacy/` holds the original PHP + MySQL version (needs XAMPP). It is kept for
reference and is not published.
