# 🔍 OCR.ai

A powerful, privacy-focused client-side Optical Character Recognition (OCR) web application built with Tesseract.js. Extract text from images directly in your browser—no server uploads required.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tesseract.js](https://img.shields.io/badge/Tesseract.js-v4.1.1-green.svg)](https://tesseract.projectnaptha.com/)

## ✨ Features

- **🔒 Privacy-First**: All OCR processing happens locally in your browser
- **🌍 Multi-Language Support**: 100+ languages including English, Spanish, Chinese, Arabic, Sinhala, and more
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **⚡ Real-Time Progress**: Visual feedback during text extraction
- **💾 Export Options**: Copy to clipboard or download as `.txt` file
- **🎨 Modern UI**: Clean, intuitive interface built with Tailwind CSS

## 🚀 Quick Start

### Local Development

1. **Clone or download** this repository

2. **Start a local server** (required for proper Tesseract.js functionality):

   **Python:**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # or Python 2
   python -m SimpleHTTPServer 8000
   ```

   **Node.js:**
   ```bash
   npx serve
   ```

   **PHP:**
   ```bash
   php -S localhost:8000
   ```

3. **Open in browser**: Navigate to `http://localhost:8000`

4. **Start extracting text**:
   - Drag & drop an image, or click "Choose file"
   - Select OCR language(s) from the dropdown
   - Click "Extract Text"
   - Copy or download the results

> **⚠️ Note**: Opening `index.html` directly (file://) may work but is not recommended due to CORS restrictions when fetching language data.

## 📁 Project Structure

```
OCR.ai/
├── index.html          # Main application UI
├── style.css           # Custom styles and animations
├── script.js           # Core application logic
├── assets/             # Sample images and resources
└── README.md           # Documentation (you are here)
```

## 🌐 Language Support

### Selecting Languages

The app supports 100+ languages through Tesseract's trained data models:

- **Single language**: Select one language from the dropdown
- **Multiple languages**: Hold `Ctrl` (Windows/Linux) or `Cmd` (Mac) to select multiple languages
- **Combined recognition**: Multiple languages are automatically combined (e.g., `eng+spa` for English and Spanish)

### Sinhala Support

This project explicitly includes **Sinhala (`sin`)** as a supported language. When selected, `sin.traineddata` will be automatically downloaded from the configured language data source.

### Performance Considerations

⚠️ **Important**: Language data files can be large (2-15 MB each). Selecting multiple languages will:
- Increase initial download time
- Consume more bandwidth
- Use more memory during processing

For best performance, select only the languages you need.

## 🔧 Advanced Configuration

### Self-Hosting Language Data

For production deployments or offline use, self-host the traineddata files:

1. **Download traineddata** from the [tessdata repository](https://github.com/naptha/tessdata/tree/gh-pages/4.0.0)

2. **Host files** on your server under `/tessdata/`

3. **Update `script.js`**:
   ```javascript
   const worker = await Tesseract.createWorker({
     langPath: 'https://yourdomain.com/tessdata',
     cachePath: './tessdata' // Optional: local cache path
   });
   ```

### Improving OCR Accuracy

Preprocess images before OCR for better results:

- **Convert to grayscale**: Reduces noise and improves contrast detection
- **Apply thresholding**: Converts to black and white for clearer text
- **Scale images**: Larger images (300 DPI+) generally perform better
- **Denoise**: Remove artifacts and compression noise
- **Deskew**: Straighten tilted text

Example preprocessing with Canvas API:
```javascript
function preprocessImage(canvas) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Convert to grayscale
  for (let i = 0; i < imageData.data.length; i += 4) {
    const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
    imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = avg;
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}
```

### Caching Strategy

Optimize performance with proper caching:

1. **HTTP Cache Headers**: Configure your server to cache traineddata files
   ```apache
   # Apache .htaccess
   <FilesMatch "\.(traineddata)$">
     Header set Cache-Control "max-age=2592000, public"
   </FilesMatch>
   ```

2. **Service Worker**: Implement offline-first caching for app assets and language data

3. **Pre-download Languages**: Add a feature to download commonly used languages ahead of time

## 📄 PDF & Multi-Page Support

### Current Limitations

The client-side implementation focuses on single images. PDFs are not directly supported.

### Workarounds

**Option 1: Manual Conversion**
- Convert PDF pages to images using tools like Adobe Acrobat, GIMP, or online converters
- Upload each page image separately

**Option 2: Server-Side Processing**
```javascript
// Example Node.js backend with pdf-poppler
const { convert } = require('pdf-poppler');

async function convertPdfToImages(pdfPath) {
  const opts = {
    format: 'png',
    out_dir: './temp',
    out_prefix: 'page',
    page: null // Convert all pages
  };
  
  await convert(pdfPath, opts);
}
```

**Option 3: Browser-Based PDF.js**
- Use Mozilla's PDF.js to render PDF pages to canvas
- Extract canvas data and pass to Tesseract

## 🐛 Troubleshooting

### `worker.load is not a function`

This is the most common error when using incompatible Tesseract.js versions.

**Diagnosis Steps:**

1. Open browser DevTools Console (F12)

2. Run these commands:
   ```javascript
   typeof Tesseract                    // Should return: "object"
   console.dir(Tesseract)              // Inspect available methods
   typeof Tesseract.createWorker       // Should return: "function"
   ```

**Solutions:**

✅ **Use the recommended CDN** (already included in this project):
```html
<script src="https://cdn.jsdelivr.net/npm/tesseract.js@4.1.1/dist/tesseract.min.js"></script>
```

❌ **Avoid legacy builds** that only expose `Tesseract.recognize()`

🔍 **Check console warnings**: The app logs detailed error messages:
- `createWorker threw during invocation:`
- `createWorker did not return a worker with .load(); worker value:`

### Language Data Download Fails

**Symptoms**: Progress bar stops, error message appears

**Causes & Solutions**:
- **CORS Issues**: Ensure you're running via HTTP server, not `file://`
- **Network Blocking**: Check firewall/proxy settings
- **CDN Unavailable**: Self-host traineddata files (see Advanced Configuration)

### Poor OCR Accuracy

**Troubleshooting checklist**:
- ✅ Is the image high resolution (300+ DPI)?
- ✅ Is the text clear and in focus?
- ✅ Did you select the correct language?
- ✅ Is the text orientation correct (not rotated)?
- ✅ Try preprocessing (grayscale, threshold)

### Performance Issues

**Optimization tips**:
- Reduce image size before processing (max 2000px width/height)
- Use fewer languages simultaneously
- Close other browser tabs to free memory
- Use a desktop browser instead of mobile for large images

## 🔒 Security & Privacy

### Data Privacy

- **100% Client-Side**: Images never leave your browser
- **No Tracking**: No analytics or user data collection
- **No External Uploads**: All processing happens locally

### Best Practices

- **Self-host in production**: Avoid CDN dependencies for sensitive deployments
- **Use HTTPS**: Serve over encrypted connections to prevent MITM attacks
- **Content Security Policy**: Implement CSP headers to restrict resource loading

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;">
```

## 🛠️ Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome/Edge | 90+ | ✅ Fully Supported |
| Firefox | 88+ | ✅ Fully Supported |
| Safari | 14+ | ✅ Supported |
| Mobile Chrome | Latest | ⚠️ Limited Performance |
| Mobile Safari | Latest | ⚠️ Limited Performance |

> **Note**: Mobile browsers work but may be slower due to CPU constraints. Desktop browsers recommended for large images.

## 🚀 Deployment

### Static Hosting (Recommended)

Deploy to any static hosting provider:

**Vercel:**
```bash
npm i -g vercel
vercel
```

**Netlify:**
```bash
npm i -g netlify-cli
netlify deploy
```

**GitHub Pages:**
1. Push to GitHub repository
2. Enable Pages in repository settings
3. Select branch and root directory

### Docker

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t ocr-app .
docker run -p 8080:80 ocr-app
```

## 🤝 Contributing

Contributions are welcome! Here are some ideas:

- 🎨 UI/UX improvements
- 🌍 Additional language support
- 📱 Better mobile experience
- 🔧 Image preprocessing filters
- 📊 Batch processing support
- 🔌 Browser extension version

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- [Tesseract.js](https://tesseract.projectnaptha.com/) - OCR engine
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) - Original C++ library
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

## 📧 Support

**Debugging Information to Provide:**

If you encounter issues, please provide:

1. Browser name and version
2. Console error messages
3. Output of these commands:
   ```javascript
   typeof Tesseract
   console.dir(Tesseract)
   typeof Tesseract.createWorker
   ```
4. Screenshot of the error (if applicable)

---

**Made with ❤️ for text extraction enthusiasts**
