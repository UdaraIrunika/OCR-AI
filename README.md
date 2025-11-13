# 🔍 OCR.ai

A powerful, privacy-focused client-side Optical Character Recognition (OCR) web application built with Tesseract.js. Extract text from images directly in your browser—no server uploads required.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tesseract.js](https://img.shields.io/badge/Tesseract.js-v4.1.1-green.svg)](https://tesseract.projectnaptha.com/)

## ✨ Features

- **🔒 Privacy-First**: All OCR processing happens locally in your browser
- **🌍 Multi-Language Support**: 25+ languages including English, Spanish, Chinese, Arabic, Sinhala, and more
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **⚡ Real-Time Progress**: Visual feedback during text extraction
- **💾 Multiple Export Options**: Copy to clipboard, download as `.txt`, or save to browser storage
- **🎨 Modern UI**: Clean, intuitive interface built with Tailwind CSS
- **🖼️ Drag & Drop**: Easy image upload via drag-and-drop or file selection

## 🚀 Quick Start

### Local Development

1. **Clone or download** this repository

2. **Start a local HTTP server** (required for proper Tesseract.js functionality):

   **Python:**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Windows (Python 3)
   py -3 -m http.server 8000
   ```

   **Node.js:**
   ```bash
   npx serve
   # or with http-server
   npx http-server -p 8000
   ```

   **PHP:**
   ```bash
   php -S localhost:8000
   ```

3. **Open in browser**: Navigate to `http://localhost:8000`

4. **Start extracting text**:
   - Drag & drop an image onto the drop zone, or click "Choose file"
   - Select OCR language(s) from the dropdown (default: English)
   - Click "Extract Text" and wait for processing
   - Copy, download, or save the extracted text

> **⚠️ Important**: Opening `index.html` directly via `file://` protocol may work but is **not recommended**. Tesseract.js requires HTTP/HTTPS to properly download language training data from the CDN.

## 📁 Project Structure

```
OCR.ai/
├── index.html          # Main application UI and structure
├── style.css           # Custom styles (spinner, animations, responsive)
├── script.js           # Core application logic and Tesseract.js integration
├── assets/             # Sample images (optional)
└── README.md           # Documentation
```

### File Overview

- **`index.html`**: Contains the entire UI built with Tailwind CSS CDN, including:
  - File upload area with drag & drop support
  - Image preview section
  - Multi-language selector
  - Progress indicator
  - Results textarea with action buttons
  - References to Tesseract.js v4.1.1 via jsDelivr CDN

- **`style.css`**: Minimal custom CSS for:
  - Animated loading spinner
  - Fade-in animation for results
  - Responsive grid adjustments for mobile

- **`script.js`**: Complete application logic including:
  - File handling (drag & drop, file input)
  - Image preview management
  - Tesseract.js worker initialization with fallback support
  - Language selection and validation
  - Progress tracking and error handling
  - Export functionality (copy, download, localStorage)

## 🌐 Language Support

### Available Languages

The application supports 25+ languages out of the box:

| Language | Code | Language | Code |
|----------|------|----------|------|
| English | `eng` | Spanish | `spa` |
| French | `fra` | German | `deu` |
| Italian | `ita` | Portuguese | `por` |
| Russian | `rus` | Chinese (Simplified) | `chi_sim` |
| Chinese (Traditional) | `chi_tra` | Japanese | `jpn` |
| Korean | `kor` | Arabic | `ara` |
| Hindi | `hin` | Hebrew | `heb` |
| Turkish | `tur` | Vietnamese | `vie` |
| Thai | `tha` | Dutch | `nld` |
| **Sinhala** | `sin` | Swedish | `swe` |
| Polish | `pol` | Ukrainian | `ukr` |
| Greek | `ell` | Danish | `dan` |
| Finnish | `fin` | Hungarian | `hun` |

### Selecting Languages

**Single Language:**
- Click once to select a language from the dropdown

**Multiple Languages:**
- Hold `Ctrl` (Windows/Linux) or `Cmd` (Mac) while clicking to select multiple languages
- Multiple languages are combined with `+` (e.g., `eng+spa` for English and Spanish documents)

**Multi-Language Recognition:**
- Useful for documents containing mixed languages
- Example: Select both `eng` and `fra` to recognize English and French text in the same image

### Performance Considerations

⚠️ **Important**: Language training data files are **2-15 MB each**. When selecting multiple languages:

- Initial download time will increase proportionally
- Memory usage during processing will be higher
- The app will warn you when selecting more than 3 languages
- **Recommendation**: Select only the languages present in your document for optimal performance

### Sinhala Language Support

This project explicitly includes **Sinhala (`sin`)** support:
- `sin.traineddata` is automatically downloaded from the CDN when selected
- File size: ~3.5 MB
- For offline usage, download the traineddata file and self-host (see Advanced Configuration)

## 🔧 Advanced Configuration

### Self-Hosting Language Data

For production deployments, offline usage, or faster loading:

1. **Download traineddata files**:
   - Official repository: [tessdata](https://github.com/naptha/tessdata/tree/gh-pages/4.0.0)
   - Direct download: `https://tessdata.projectnaptha.com/4.0.0/[lang].traineddata.gz`
   - Example: `https://tessdata.projectnaptha.com/4.0.0/sin.traineddata.gz` for Sinhala

2. **Create a tessdata directory** on your server:
   ```
   your-server/
   └── tessdata/
       ├── eng.traineddata
       ├── spa.traineddata
       ├── sin.traineddata
       └── ...
   ```

3. **Update `script.js`** (line ~94):
   ```javascript
   maybeWorker = Tesseract.createWorker({
     logger: m => { /* ... */ },
     langPath: 'https://yourdomain.com/tessdata'  // Change this line
   });
   ```

4. **Configure cache headers** on your server:
   ```apache
   # Apache .htaccess
   <FilesMatch "\.(traineddata)$">
     Header set Cache-Control "max-age=31536000, public, immutable"
   </FilesMatch>
   ```

   ```nginx
   # Nginx
   location ~* \.traineddata$ {
     expires 1y;
     add_header Cache-Control "public, immutable";
   }
   ```

### Improving OCR Accuracy

The current implementation processes images as-is. For better results, consider preprocessing:

**Image Quality Tips:**
- Use high-resolution images (300 DPI or higher)
- Ensure good contrast between text and background
- Avoid blurry or low-quality photos
- Straighten skewed or rotated text

**Optional Preprocessing** (requires code modifications):

```javascript
// Add this function to script.js
function preprocessImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Convert to grayscale
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = data[i + 1] = data[i + 2] = avg;
      }
      
      ctx.putImageData(imageData, 0, 0);
      canvas.toBlob(resolve, 'image/png');
    };
    img.src = URL.createObjectURL(file);
  });
}
```

### Caching Strategy

**Current Implementation:**
- Tesseract.js automatically caches downloaded traineddata in browser memory
- `localStorage` is used to persist the last extracted text between sessions

**Recommendations for Production:**
1. Implement Service Worker for offline-first experience
2. Pre-cache commonly used language files
3. Add cache versioning for traineddata updates

## 💾 Data Persistence

### Local Storage Feature

The app includes a "Save Locally" button that stores extracted text in browser localStorage:

```javascript
// Saved automatically when you click "Save Locally"
localStorage.setItem('ocrai_last_text', result.value);

// Automatically loaded on page refresh
window.addEventListener('load', () => {
  const last = localStorage.getItem('ocrai_last_text');
  if (last) result.value = last;
});
```

**Important Notes:**
- Data persists only in the current browser
- Storage limit: ~5-10 MB (varies by browser)
- Clearing browser data will erase saved text
- Not suitable for sensitive information (unencrypted)

## 📄 PDF & Multi-Page Support

### Current Limitations

This client-side implementation focuses on **single image files** (JPG, PNG). PDF support is **not included** in the current version.

### Workarounds

**Option 1: Manual Conversion**
- Convert PDF pages to images using:
  - Adobe Acrobat Reader (Export → Image → PNG)
  - Online tools (PDF2PNG, ILovePDF)
  - Command-line tools (ImageMagick, pdftoppm)
- Upload each page image separately

**Option 2: PDF.js Integration** (requires code modification)
```javascript
// Add PDF.js library
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>

// Process PDF pages
async function processPdf(file) {
  const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const viewport = page.getViewport({ scale: 2.0 });
    
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    await page.render({ canvasContext: ctx, viewport }).promise;
    canvas.toBlob(blob => {
      // Process this blob with Tesseract
    });
  }
}
```

**Option 3: Server-Side Processing**
- Build a backend API (Node.js, Python, etc.)
- Use libraries like `pdf-poppler`, `pdf2image`, or `ghostscript`
- Return processed images to the client for OCR

## 🐛 Troubleshooting

### Common Issues

#### `worker.load is not a function`

**This is the most common error** when using incompatible Tesseract.js builds.

**Diagnosis:**
1. Open browser DevTools (F12) → Console tab
2. Run these commands:
   ```javascript
   typeof Tesseract                    // Expected: "object"
   console.dir(Tesseract)              // Should show createWorker and recognize
   typeof Tesseract.createWorker       // Expected: "function"
   ```

**Solutions:**

✅ **Verify you're using the correct CDN** (already included in `index.html`):
```html
<script src="https://cdn.jsdelivr.net/npm/tesseract.js@4.1.1/dist/tesseract.min.js"></script>
```

✅ **The app includes fallback logic** that handles:
- `createWorker` returning a Promise (auto-awaits)
- `createWorker` unavailable (falls back to `Tesseract.recognize`)
- Different response formats from various Tesseract builds

✅ **Check console for warnings**:
- `createWorker threw during invocation:` → Build incompatibility
- `createWorker did not return a worker with .load()` → Unexpected return value

❌ **Don't mix multiple Tesseract versions** or use custom builds without testing

---

#### Language Download Fails

**Symptoms:**
- Progress bar stops at "loading language"
- Error message appears
- Console shows CORS or network errors

**Causes & Solutions:**

| Cause | Solution |
|-------|----------|
| Not using HTTP server | Run via `python -m http.server` or similar |
| Firewall/proxy blocking | Whitelist `tessdata.projectnaptha.com` |
| CDN unavailable | Self-host traineddata files (see Advanced Configuration) |
| Browser blocking mixed content | Ensure page is served over HTTPS if using HTTPS traineddata source |

---

#### Poor OCR Accuracy

**Troubleshooting Checklist:**

- [ ] Is the image high resolution (300+ DPI)?
- [ ] Is the text clear and in focus?
- [ ] Did you select the correct language?
- [ ] Is the text properly oriented (not rotated/upside down)?
- [ ] Is there sufficient contrast between text and background?
- [ ] Is the font standard and readable (not decorative/handwritten)?

**Improvement Tips:**
- Take photos in good lighting
- Hold camera steady to avoid blur
- Capture text straight-on (avoid angles)
- Use scanner instead of camera when possible
- Pre-process images (grayscale, increase contrast)

---

#### Performance Issues / Browser Freezing

**Causes:**
- Large image file size
- Multiple languages selected
- Insufficient device memory
- Too many browser tabs open

**Solutions:**
1. **Reduce image size** before processing:
   ```javascript
   // Add to handleFile() function
   if (f.size > 5 * 1024 * 1024) { // 5MB
     alert('Image is very large. Consider resizing for better performance.');
   }
   ```

2. **Limit language selection** to 1-2 languages
3. **Close unnecessary browser tabs**
4. **Use desktop browser** instead of mobile for large images
5. **Consider batch processing** for multiple images (process one at a time)

---

#### "Unsupported file type" Error

**Cause:** Attempting to upload non-image files

**Supported Formats:**
- ✅ JPEG (.jpg, .jpeg)
- ✅ PNG (.png)
- ❌ PDF (.pdf) - not supported in current version
- ❌ TIFF (.tiff) - may work but not officially supported
- ❌ WebP (.webp) - browser-dependent

**Solution:** Convert files to JPG or PNG before uploading

## 🔒 Security & Privacy

### Privacy Guarantees

✅ **100% Client-Side Processing**
- Images are processed entirely in your browser
- No data is uploaded to external servers
- No tracking or analytics
- No cookies or persistent identifiers

✅ **Third-Party Resources**
- Tesseract.js library: jsDelivr CDN (open source, verified)
- Language traineddata: tessdata.projectnaptha.com (official Tesseract data)
- Tailwind CSS: Tailwind CDN (styling framework)

### Best Practices for Production

**For Public Deployment:**
1. **Self-host all resources** (Tesseract.js, traineddata, Tailwind)
2. **Implement Content Security Policy**:
   ```html
   <meta http-equiv="Content-Security-Policy" 
         content="default-src 'self'; 
                  script-src 'self' https://cdn.jsdelivr.net https://cdn.tailwindcss.com; 
                  style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com;
                  img-src 'self' blob: data:;">
   ```

3. **Use HTTPS** exclusively
4. **Add Subresource Integrity (SRI)** hashes:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/tesseract.js@4.1.1/dist/tesseract.min.js"
           integrity="sha384-..."
           crossorigin="anonymous"></script>
   ```

**For Sensitive Documents:**
- Deploy on internal network or localhost
- Self-host all dependencies (no external CDNs)
- Consider adding encryption for localStorage

## 🛠️ Browser Compatibility

| Browser | Desktop | Mobile | Notes |
|---------|---------|--------|-------|
| **Chrome** | ✅ 90+ | ⚠️ Limited | Recommended for best performance |
| **Edge** | ✅ 90+ | ⚠️ Limited | Chromium-based, full support |
| **Firefox** | ✅ 88+ | ⚠️ Limited | Excellent compatibility |
| **Safari** | ✅ 14+ | ⚠️ Limited | May have slower processing |
| **Opera** | ✅ 76+ | ⚠️ Limited | Chromium-based |

**Mobile Considerations:**
- Processing is significantly slower on mobile devices
- Large images may cause memory issues
- Recommended to use desktop browsers for:
  - Images larger than 2 MB
  - Multiple language processing
  - Batch operations

**Required Browser Features:**
- JavaScript ES6+ (async/await, Promises, arrow functions)
- Web Workers (for Tesseract.js background processing)
- Blob API and URL.createObjectURL
- FileReader API
- Clipboard API (for copy function)
- localStorage API (for save function)

## 🚀 Deployment

### Static Hosting (Recommended)

This app is pure HTML/CSS/JavaScript with no build process required.

**Netlify:**
1. Drag and drop the project folder into Netlify
2. Or use CLI:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=.
   ```

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

**GitHub Pages:**
1. Push code to GitHub repository
2. Go to Settings → Pages
3. Select branch and root directory
4. Access at `https://username.github.io/repo-name`

**Firebase Hosting:**
```bash
npm install -g firebase-tools
firebase init hosting
firebase deploy
```

### Docker Deployment

**Dockerfile:**
```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Build and run:**
```bash
docker build -t ocr-app .
docker run -d -p 8080:80 ocr-app
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  ocr-app:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
```

### Server Configuration

**Apache (.htaccess):**
```apache
# Enable gzip compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 1 hour"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
</IfModule>
```

**Nginx:**
```nginx
server {
    listen 80;
    server_name ocr.example.com;
    root /var/www/ocr-app;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static files
    location ~* \.(css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/javascript;
}
```

## 🤝 Contributing

Contributions are welcome! Here are some ideas for improvements:

### Feature Ideas
- [ ] **Batch Processing**: Upload and process multiple images
- [ ] **Image Preprocessing UI**: Add brightness/contrast/rotation controls
- [ ] **Text Post-Processing**: Spell check, formatting options
- [ ] **History Feature**: Keep track of previous OCR results
- [ ] **PDF Support**: Client-side PDF page extraction
- [ ] **Export Formats**: Add Word, CSV, JSON export options
- [ ] **Language Auto-Detection**: Automatically detect document language
- [ ] **Keyboard Shortcuts**: Add hotkeys for common actions
- [ ] **Progress Resume**: Save and resume interrupted OCR jobs
- [ ] **Dark Mode**: Add dark theme support

### Code Quality
- Add TypeScript definitions
- Implement unit tests (Jest/Vitest)
- Add E2E tests (Playwright/Cypress)
- Improve error handling and user feedback
- Add accessibility improvements (ARIA labels, keyboard navigation)

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

**MIT License**

Copyright (c) 2025 OCR.ai

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## 🙏 Acknowledgments

- **[Tesseract.js](https://tesseract.projectnaptha.com/)** - JavaScript OCR engine by Kevin Kwok
- **[Tesseract OCR](https://github.com/tesseract-ocr/tesseract)** - Original C++ OCR library by Google
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[tessdata](https://github.com/naptha/tessdata)** - Trained language data files

## 📞 Support

### Getting Help

**For Bugs or Issues:**
1. Check this README's Troubleshooting section
2. Search existing issues on GitHub
3. Open a new issue with:
   - Browser name and version
   - Console error messages
   - Steps to reproduce
   - Screenshots (if applicable)

**Debugging Information to Include:**

When reporting issues, please provide:

```javascript
// Run in browser console and include output
console.log('Browser:', navigator.userAgent);
console.log('Tesseract type:', typeof Tesseract);
console.log('Tesseract object:', Tesseract);
console.log('createWorker type:', typeof Tesseract.createWorker);
```

Also include:
- Any console warnings/errors
- Screenshot of the error
- The file type and size you tried to process
- Languages selected

### Useful Resources

- [Tesseract.js Documentation](https://tesseract.projectnaptha.com/)
- [Tesseract OCR Wiki](https://github.com/tesseract-ocr/tesseract/wiki)
- [Improving OCR Quality](https://tesseract-ocr.github.io/tessdoc/ImproveQuality.html)
- [Supported Languages](https://tesseract-ocr.github.io/tessdoc/Data-Files-in-different-versions.html)

---

<div align="center">

**Made with ❤️ for text extraction enthusiasts**
**Developed By UI ❤️ Owner of UI DESIGNERS AND DEVELOPERS**

⭐ Star this project if you find it useful!

</div>
