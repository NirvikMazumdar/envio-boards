# envio-boards

Free, self-hosted **Excalidraw** flowchart / whiteboard for planning. No login,
no server, no cost — a static build hosted on GitHub Pages. Boards autosave in
your browser.

## Live app

Hosted via GitHub Pages (see the repo's **Actions** → *Deploy to GitHub Pages* for the URL).

## Features

- Full Excalidraw editor: shapes, arrows, freehand, text, libraries, frames, dark mode.
- **Autosave** to your browser's localStorage — boards persist between sessions.
- **Export**: PNG / SVG in-app; for **PDF** use the browser's Print → *Save as PDF*.
- Move/share boards via the in-app menu → **Export / Import `.excalidraw` files**.

## Limitations (by design — this is the free static build)

- **No accounts and no shared central storage.** Boards are per-browser. To share a
  board, export the `.excalidraw` file. A multi-user version with login + comments
  would need a backend server (not free static hosting).
- Pasted **images** are not persisted across reloads (export the file to keep them).

## Run locally (macOS / Windows / Linux)

Requires Node.js 18+.

```bash
npm install
npm run dev      # dev server, prints a localhost URL
# or
npm run build && npm run preview   # production build preview
```

## How hosting works

Push to `main` triggers `.github/workflows/deploy.yml`, which builds the app and
publishes `dist/` to GitHub Pages. The Vite `base` is relative (`./`) so assets
resolve correctly under the Pages project subpath.
