
import React, { useState, useCallback } from 'react';
import { generatePresentationFromText } from './services/geminiService';
import { Presentation } from './types';
import FileUpload from './components/FileUpload';
import PresentationView from './components/PresentationView';
import Loader from './components/Loader';
import ApiKeyManager from './components/ApiKeyManager';
import { LogoIcon, GithubIcon } from './components/Icons';

// pdf.js and Tesseract are loaded from CDN, declare them to TypeScript
declare const pdfjsLib: any;
declare const Tesseract: any;

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(() => sessionStorage.getItem('gemini-api-key'));
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleKeySubmit = (key: string) => {
    sessionStorage.setItem('gemini-api-key', key);
    setApiKey(key);
  };

  const handleGenerate = useCallback(async (file: File) => {
    if (!file) {
      setError('Please select a PDF file first.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setPresentation(null);

    try {
      // 1. Process PDF and convert pages to images
      setLoadingMessage('Step 1/3: Reading PDF and preparing pages...');
      const fileBuffer = await file.arrayBuffer();
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise;
      const numPages = pdf.numPages;
      const pageImageUrls: string[] = [];

      for (let i = 1; i <= numPages; i++) {
        setLoadingMessage(`Step 1/3: Reading PDF... (Page ${i}/${numPages})`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            pageImageUrls.push(canvas.toDataURL());
        }
      }
      
      // 2. Perform OCR on images
      setLoadingMessage('Step 2/3: Extracting text with OCR... (This may take a while)');
      const worker = await Tesseract.createWorker('eng', 1, {
        logger: (m: any) => {
             if (m.status === 'recognizing text') {
                 const progress = (m.progress * 100).toFixed(0);
                 setLoadingMessage(`Step 2/3: Extracting text... (${progress}%)`);
             }
        }
      });
      
      let fullText = '';
      for (const imageUrl of pageImageUrls) {
        const { data: { text } } = await worker.recognize(imageUrl);
        fullText += text + '\n\n';
      }
      await worker.terminate();
      
      if (!fullText.trim()) {
          throw new Error("OCR could not extract any text from the PDF. The document might be image-only with unreadable text.");
      }

      // 3. Generate presentation with Gemini
      setLoadingMessage('Step 3/3: Generating presentation with AI...');
      const generatedPresentation = await generatePresentationFromText(fullText);
      setPresentation(generatedPresentation);

    } catch (err: any) {
      console.error(err);
      setError(`An error occurred: ${err.message}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, []);

  if (!apiKey) {
    return <ApiKeyManager onKeySubmit={handleKeySubmit} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-5xl flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <LogoIcon className="w-10 h-10 text-cyan-400" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            PDF to Presentation AI
          </h1>
        </div>
        <a href="https://github.com/google/generative-ai-docs/tree/main/demos/pdf_presentation_maker" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-400 transition-colors">
          <GithubIcon className="w-7 h-7" />
        </a>
      </header>

      <main className="w-full max-w-5xl flex-grow flex flex-col items-center">
        <p className="text-center text-slate-400 mb-8 max-w-2xl">
          Upload a text-based PDF, and our AI will perform OCR to extract the content and automatically structure it into a downloadable presentation format.
        </p>
        
        <div className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-2xl mb-8">
          <FileUpload onGenerate={handleGenerate} disabled={isLoading} />
        </div>

        {isLoading && <Loader message={loadingMessage} />}
        
        {error && (
            <div className="w-full max-w-3xl bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center">
                <p className="font-semibold">Error</p>
                <p>{error}</p>
            </div>
        )}

        {presentation && !isLoading && (
          <div className="w-full animate-fade-in">
            <PresentationView presentation={presentation} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
