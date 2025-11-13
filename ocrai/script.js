// OCR.ai - client-side OCR using Tesseract.js

const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const preview = document.getElementById('preview');
const placeholderPreview = document.getElementById('placeholderPreview');
const processBtn = document.getElementById('processBtn');
const clearBtn = document.getElementById('clearBtn');
const result = document.getElementById('result');
const progressText = document.getElementById('progressText');
const spinnerArea = document.getElementById('spinnerArea');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const saveLocalBtn = document.getElementById('saveLocalBtn');
const languageSelect = document.getElementById('languageSelect');

let currentFile = null;

function setProgress(text){
  progressText.textContent = text;
}

function showSpinner(show){
  spinnerArea.classList.toggle('hidden', !show);
}

function reset(){
  currentFile = null;
  preview.src = '';
  preview.classList.add('hidden');
  placeholderPreview.classList.remove('hidden');
  result.value = '';
  processBtn.disabled = true;
  setProgress('idle');
}

clearBtn.addEventListener('click', ()=>{
  reset();
});


// Handle file input
fileInput.addEventListener('change', (e)=>{
  const f = e.target.files[0];
  handleFile(f);
});

// Drag & drop
['dragenter','dragover'].forEach(evt=>{
  dropZone.addEventListener(evt, (e)=>{
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('ring-2','ring-sky-200');
  });
});
['dragleave','drop'].forEach(evt=>{
  dropZone.addEventListener(evt, (e)=>{
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('ring-2','ring-sky-200');
  });
});

dropZone.addEventListener('drop', (e)=>{
  const f = e.dataTransfer.files[0];
  handleFile(f);
});

function handleFile(f){
  if(!f) return;
  const supportedImage = f.type.startsWith('image/');
  if(!supportedImage){
    alert('Unsupported file type. Please upload an image (JPG, PNG).');
    return;
  }
  currentFile = f;
  const url = URL.createObjectURL(f);
  preview.src = url;
  preview.classList.remove('hidden');
  placeholderPreview.classList.add('hidden');
  processBtn.disabled = false;
  setProgress('ready');
}

processBtn.addEventListener('click', async ()=>{
  if(!currentFile) return;
  // gather selected languages
  const selected = Array.from(languageSelect.selectedOptions).map(o => o.value);
  const langs = selected.length ? selected.join('+') : 'eng';

  if(selected.length > 3){
    const ok = confirm('You selected ' + selected.length + ' languages. This will download multiple traineddata files and may be slow. Continue?');
    if(!ok) return;
  }

  processBtn.disabled = true;
  setProgress('starting');
  showSpinner(true);

  try{
    // Preferred: use createWorker API when available
    if(typeof Tesseract !== 'undefined'){
      console.debug('Tesseract presence:', Tesseract);
    }

    if(typeof Tesseract !== 'undefined' && typeof Tesseract.createWorker === 'function'){
      // createWorker may in some builds return the worker or a promise; handle both
      let maybeWorker = null;
      try{
        maybeWorker = Tesseract.createWorker({
          logger: m => {
            if(m.status === 'recognizing text'){
              setProgress('recognizing: ' + Math.round(m.progress*100) + '%');
            } else if(m.progress){
              setProgress(m.status + ' ' + Math.round(m.progress*100) + '%');
            } else {
              setProgress(m.status || 'working');
            }
          },
          langPath: 'https://tessdata.projectnaptha.com/4.0.0'
        });
      }catch(errCW){
        console.warn('createWorker threw during invocation:', errCW);
        maybeWorker = null;
      }

      // await if a Promise was returned
      const worker = (maybeWorker && typeof maybeWorker.then === 'function') ? await maybeWorker : maybeWorker;

      if(!worker || typeof worker.load !== 'function'){
        console.warn('createWorker did not return a worker with .load(); worker value:', worker);
        throw new Error('createWorker returned unexpected object; falling back to Tesseract.recognize');
      }

      // Now load languages & initialize
      await worker.load();
      await worker.loadLanguage(langs);
      await worker.initialize(langs);
      const { data: { text } } = await worker.recognize(currentFile);
      result.value = text;
      result.classList.add('fade-in');
      setProgress('done');
      await worker.terminate();

    } else if(typeof Tesseract !== 'undefined' && typeof Tesseract.recognize === 'function'){
      // Fallback: older or different build that doesn't expose createWorker
      // Call recognize directly; pass lang string as second arg if supported
      let text = '';
      // Try calling recognize with (image, lang, options)
      try{
        const res = await Tesseract.recognize(currentFile, langs, {
          logger: m => {
            if(m.status === 'recognizing text'){
              setProgress('recognizing: ' + Math.round(m.progress*100) + '%');
            } else if(m.progress){
              setProgress(m.status + ' ' + Math.round(m.progress*100) + '%');
            } else {
              setProgress(m.status || 'working');
            }
          }
        });
        // some builds return the text directly, others nested
        text = (res && res.data && res.data.text) ? res.data.text : (res && res.text) ? res.text : String(res || '');
      }catch(innerErr){
        // try alternate signature: recognize(image, { lang: 'eng' })
        const res2 = await Tesseract.recognize(currentFile, { lang: langs });
        text = (res2 && res2.data && res2.data.text) ? res2.data.text : (res2 && res2.text) ? res2.text : String(res2 || '');
      }

      result.value = text;
      result.classList.add('fade-in');
      setProgress('done');

    } else {
      throw new Error('Tesseract API not found in this environment.');
    }
  }catch(err){
    console.error('OCR error', err, 'Tesseract:', typeof Tesseract !== 'undefined' ? Tesseract : 'undefined');
    alert('OCR failed: ' + (err && err.message ? err.message : String(err)));
    setProgress('error');
  }finally{
    processBtn.disabled = false;
    showSpinner(false);
  }
});

copyBtn.addEventListener('click', async ()=>{
  try{
    await navigator.clipboard.writeText(result.value);
    copyBtn.textContent = 'Copied!';
    setTimeout(()=>copyBtn.textContent = 'Copy', 1500);
  }catch(err){
    alert('Copy failed: ' + err.message);
  }
});

downloadBtn.addEventListener('click', ()=>{
  const blob = new Blob([result.value], {type: 'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ocr-output.txt';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

saveLocalBtn.addEventListener('click', ()=>{
  try{
    localStorage.setItem('ocrai_last_text', result.value);
    alert('Saved locally in browser storage.');
  }catch(err){
    alert('Save failed: ' + err.message);
  }
});

// Load last saved
window.addEventListener('load', ()=>{
  const last = localStorage.getItem('ocrai_last_text');
  if(last){
    result.value = last;
  }
});

// Initialize
reset();
