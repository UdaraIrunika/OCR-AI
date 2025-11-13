# OCR.ai

Simple client-side OCR web app using Tesseract.js.

Files:
- `index.html` - main UI
- `style.css` - small custom styles
- `script.js` - app logic using Tesseract.js

Usage:
1. Open `index.html` in a browser (prefer Chrome/Edge/Firefox).
2. Drag and drop an image or click "Choose file".
3. Click "Extract Text" to run OCR.
4. Copy or download the extracted text.

Notes:
- This app performs OCR in the browser using Tesseract.js.
- PDFs and multi-page documents are not processed client-side; use a backend or pre-convert PDFs to images.
- For improved accuracy, consider preprocessing images (grayscale, threshold, denoise).
 - This app performs OCR in the browser using Tesseract.js.
 - Multi-language support: select one or more languages from the "OCR Language(s)" control. Selected traineddata files will be downloaded from a public CDN at runtime.
	 - Example: choose `eng+spa` to recognize English and Spanish in the same document.
	 - Warning: selecting many languages will download multiple large files and may be slow or data-heavy.
 - PDFs and multi-page documents are not processed client-side; use a backend or pre-convert PDFs to images.
 - For improved accuracy, consider preprocessing images (grayscale, threshold, denoise).

Language data source:
- The app uses `https://tessdata.projectnaptha.com/4.0.0` by default to fetch traineddata. You can self-host traineddata files and change the `langPath` in `script.js` for offline or faster usage.
 - The app uses `https://tessdata.projectnaptha.com/4.0.0` by default to fetch traineddata. You can self-host traineddata files and change the `langPath` in `script.js` for offline or faster usage.

Sinhala support:
- This project includes `sin` (Sinhala) as a selectable language option. Tesseract traineddata for Sinhala will be downloaded from the configured `langPath` when selected. If you need an offline setup, download `sin.traineddata` and host it on your own server, then change `langPath` in `script.js`.

# OCR.ai — Advanced Usage & Developer Guide

OCR.ai is a client-first Optical Character Recognition web app built with Tesseract.js. It runs OCR in the browser and exposes a flexible UI for multi-language recognition, including Sinhala (`sin`). This README documents advanced configuration, troubleshooting, and deployment notes.

## Project structure

- `index.html` — main app UI and references to Tailwind and Tesseract.js.
- `style.css` — small custom styles (spinner, fade-in, responsive tweaks).
- `script.js` — application logic: upload handling, preview, Tesseract worker or fallback usage, language selector, progress and error handling.
- `assets/` — sample image(s).

## Quickstart (local)

Serve the folder on a local HTTP server (recommended) and open in a modern browser:

PowerShell (Windows):

```powershell
py -3 -m http.server 8000
# or
python -m http.server 8000
```

Then visit `http://localhost:8000` and open `index.html`.

Alternatively, opening `index.html` directly may work but some browser features and hosted tessdata downloads work more reliably over HTTP/HTTPS.

## Usage

1. Drag & drop an image (JPG/PNG) or click `Choose file`.
2. Pick the OCR language(s) from the multi-select. Hold Ctrl/Cmd to select multiple; multiple languages are combined with `+` (e.g. `eng+spa`).
3. Click `Extract Text` and wait for progress updates.
4. Copy, Download `.txt`, or Save text locally.

## Languages & Sinhala

- The UI includes many language options and explicitly includes `sin` (Sinhala). Selecting `sin` will download `sin.traineddata` from the configured `langPath` at runtime.
- Warning: traineddata files can be large. Selecting multiple languages increases network usage and load time.

## Where language data comes from

By default, the app points `langPath` at a public tessdata CDN. You can self-host traineddata files (recommended for production) and change the `langPath` in `script.js` when creating the Tesseract worker.

Example change in `script.js`:

```js
// set langPath to your hosted tessdata URL
const worker = Tesseract.createWorker({ langPath: 'https://yourserver.example/tessdata' });
```

## Caching & performance

- Self-host traineddata and enable cache headers on your server to avoid re-downloading.
- Consider adding a "Pre-download languages" button that fetches traineddata ahead of time (and caches it via HTTP cache or a Service Worker).
- Preprocess images (grayscale, threshold, scaling) to improve recognition accuracy and speed.

## PDF & multi-page support

- Client-side OCR here focuses on images. For PDFs, convert pages to images (server-side or using WASM tools) and then OCR each page.
- Optionally implement a small Node backend to accept PDFs, convert pages to PNG, and run OCR server-side (useful for large PDFs or batch jobs).

## Troubleshooting — `worker.load is not a function`

This is the most common reported issue when mixing different Tesseract builds/bundles. The app contains defensive fallback code but understanding the cause helps:

1. What it means
	- The code attempted to call `.load()` on the object returned by `Tesseract.createWorker()` but the returned value did not expose `.load()`.

2. Likely causes
	- A different Tesseract bundle was loaded that does not support `createWorker` (some legacy or custom builds expose only `recognize`).
	- `createWorker()` returned a Promise that resolved to an unexpected shape (the code now handles Promise returns, but older builds may still differ).

3. How to debug (open DevTools → Console)
	- Run `typeof Tesseract` — you should see `object`.
	- Run `console.dir(Tesseract)` — inspect available methods. Look for `createWorker` and `recognize`.
	- Run `typeof Tesseract.createWorker` — expected `function` in Tesseract v4+ builds.

4. Fixes
	- Use the recommended CDN build used by this project:

```html
<script src="https://cdn.jsdelivr.net/npm/tesseract.js@4.1.1/dist/tesseract.min.js"></script>
```

	- If you must use a different build, ensure it exposes either `createWorker()` (preferred) or `recognize()` and adapt `script.js` accordingly.
	- If `createWorker` exists but calling it throws or returns an unexpected value, check the console warnings printed by the app: it will log `createWorker threw during invocation:` or `createWorker did not return a worker with .load(); worker value:` which helps pinpoint the mismatch.

## Additional debugging output to collect (for support)

If you still need help, copy/paste the following console outputs after attempting an OCR run:

- Any `console.warn` or `console.error` lines including `createWorker threw during invocation:` or `createWorker did not return a worker with .load();`
- The error alert text shown in the UI (will start with `OCR failed:`)
- The results of these console commands:

```js
typeof Tesseract
console.dir(Tesseract)
typeof Tesseract.createWorker
```

## Security & privacy

- OCR is client-side by default — images are not uploaded to any server unless you modify the code.
- If you self-host tessdata, serve it over HTTPS to avoid mixed-content browser blocking.

## Extending this project

- Add a service-worker-based cache for traineddata and app assets.
- Implement image preprocessing to improve OCR accuracy (canvas-based filters or `sharp` server-side).
- Add server-side PDF handling for multi-page documents.

## Compatibility

- Designed for modern Chromium browsers and Firefox. Mobile browsers can work but performance depends on device CPU.

## License

MIT
