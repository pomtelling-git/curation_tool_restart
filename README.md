## Visual Curator

A small responsive web app for curating image and video files via drag-and-drop from your local machine.

### Features

- Drag and drop image and video files anywhere in the window.
- Files appear immediately in a responsive grid gallery.
- Images and videos never leave your machine; they are handled entirely in your browser memory.

### How to run locally

You need any simple static file server. Two easy options:

#### Option 1: Using Python (no extra installs)

From the `visual-curator` folder:

```bash
cd visual-curator
python3 -m http.server 5173
```

Then open `http://localhost:5173` in your browser.

#### Option 2: Using Node/npm (optional)

From the `visual-curator` folder:

```bash
cd visual-curator
npx serve .
```

Then open the printed URL (typically `http://localhost:3000`).

### Notes

- Files are not persisted across page reloads; they live only for the current browser session.
- To support real uploads (e.g., saving on a server or cloud), you would add a backend endpoint and call it from `script.js` where the files are handled.

