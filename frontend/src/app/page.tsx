'use client';

import { useState, useRef } from 'react';
import {
  Upload,
  X,
  Loader2,
  Download,
  ArrowRight,
  ImageIcon,
} from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [resultType, setResultType] = useState<'text' | 'image' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  const handleFile = (selected: File) => {
    if (!selected.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WEBP).');
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
    setResultType(null);
    setError(null);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setResultType(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setResultType(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/process', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to process image');
      }
      const data = await response.json();
      if (data.image) {
        setResult(data.image);
        setResultType('image');
      } else {
        setResult(data.detail || 'No image returned');
        setResultType('text');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">

      {/* ── Nav ── */}
      <nav className="shrink-0 h-14 border-b border-neutral-200 flex items-center justify-between px-6 lg:px-10">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-black" />
          <span
            className="font-mono text-sm font-bold tracking-[0.2em] uppercase"
            style={{ fontFamily: 'var(--font-geist-mono)' }}
          >
            ReImage
          </span>
        </div>
        <span
          className="hidden sm:block font-mono text-[10px] text-neutral-400 tracking-[0.2em] uppercase"
          style={{ fontFamily: 'var(--font-geist-mono)' }}
        >
          AI Portrait Studio
        </span>
        <span
          className="font-mono text-[10px] text-neutral-300 tracking-widest"
          style={{ fontFamily: 'var(--font-geist-mono)' }}
        >
          v2.0
        </span>
      </nav>

      {/* ── Hero ── */}
      <section className="shrink-0 border-b border-neutral-200 py-14 px-6 lg:px-10 text-center">
        <p
          className="font-mono text-[10px] tracking-[0.35em] uppercase text-neutral-400 mb-5"
          style={{ fontFamily: 'var(--font-geist-mono)' }}
        >
          Powered by Google Gemini
        </p>
        <h1 className="text-[clamp(2.8rem,7vw,5.5rem)] font-black leading-none tracking-tight text-black">
          Portrait to Cartoon.
        </h1>
        <p className="mt-5 text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
          Upload any portrait photo and transform it into a professional
          cartoon illustration. White background, studio lighting, features
          preserved.
        </p>
      </section>

      {/* ── Workspace ── */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200">

        {/* Upload Panel */}
        <div className="flex flex-col gap-5 p-6 lg:p-8">

          {/* Label row */}
          <div className="flex items-center justify-between">
            <span
              className="font-mono text-[10px] tracking-[0.3em] uppercase text-neutral-400"
              style={{ fontFamily: 'var(--font-geist-mono)' }}
            >
              01 — Upload
            </span>
            {file && (
              <button
                onClick={clearFile}
                className="flex items-center gap-1 font-mono text-[10px] tracking-widest uppercase text-neutral-400 hover:text-black transition-colors"
                style={{ fontFamily: 'var(--font-geist-mono)' }}
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>

          {/* Drop zone */}
          <div
            className={[
              'relative flex-1 min-h-96 flex flex-col items-center justify-center',
              'border-2 transition-all duration-150',
              isDragging
                ? 'border-black bg-neutral-50'
                : 'border-dashed border-neutral-300 hover:border-black',
              error ? 'border-neutral-300' : '',
              !preview ? 'cursor-pointer' : '',
            ].join(' ')}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !preview && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!preview ? (
              <div className="text-center select-none p-8">
                <div className="w-14 h-14 border border-neutral-200 flex items-center justify-center mx-auto mb-5">
                  <Upload className="w-5 h-5 text-neutral-400" />
                </div>
                <p className="text-sm font-medium text-black mb-1">
                  Drop your portrait here
                </p>
                <p className="text-xs text-neutral-400 mb-6">
                  or click to browse files
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-5 py-2 bg-black text-white text-xs font-medium tracking-wider uppercase hover:bg-neutral-800 transition-colors"
                >
                  Choose File
                </button>
                <p
                  className="mt-4 font-mono text-[10px] text-neutral-300 tracking-wider"
                  style={{ fontFamily: 'var(--font-geist-mono)' }}
                >
                  JPG · PNG · WEBP · Max 5MB
                </p>
              </div>
            ) : (
              <div className="relative w-full h-full min-h-96">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                  className="absolute top-3 right-3 w-8 h-8 bg-black text-white flex items-center justify-center hover:bg-neutral-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* File info strip */}
          {file && (
            <div className="flex items-center justify-between border border-neutral-200 px-4 py-2.5">
              <span
                className="font-mono text-[10px] text-neutral-500 truncate mr-4 max-w-[70%]"
                style={{ fontFamily: 'var(--font-geist-mono)' }}
              >
                {file.name}
              </span>
              <span
                className="font-mono text-[10px] text-neutral-300 shrink-0"
                style={{ fontFamily: 'var(--font-geist-mono)' }}
              >
                {(file.size / 1024).toFixed(0)} KB
              </span>
            </div>
          )}

          {/* Error strip */}
          {error && (
            <div className="border border-neutral-200 bg-neutral-50 px-4 py-3 flex items-start gap-3">
              <span
                className="font-mono text-[10px] font-bold text-black shrink-0 mt-px"
                style={{ fontFamily: 'var(--font-geist-mono)' }}
              >
                ERR
              </span>
              <span
                className="font-mono text-[10px] text-neutral-500"
                style={{ fontFamily: 'var(--font-geist-mono)' }}
              >
                {error}
              </span>
            </div>
          )}

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!file || loading}
            className={[
              'w-full h-12 flex items-center justify-center gap-2.5',
              'font-mono text-xs tracking-[0.2em] uppercase font-medium',
              'transition-colors duration-150',
              !file || loading
                ? 'bg-neutral-100 text-neutral-300 cursor-not-allowed'
                : 'bg-black text-white hover:bg-neutral-800',
            ].join(' ')}
            style={{ fontFamily: 'var(--font-geist-mono)' }}
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Processing…
              </>
            ) : (
              <>
                Generate
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Result Panel */}
        <div className="flex flex-col gap-5 p-6 lg:p-8 bg-neutral-50">

          {/* Label row */}
          <div className="flex items-center justify-between">
            <span
              className="font-mono text-[10px] tracking-[0.3em] uppercase text-neutral-400"
              style={{ fontFamily: 'var(--font-geist-mono)' }}
            >
              02 — Result
            </span>
            {result && resultType === 'image' && (
              <a
                href={`data:image/png;base64,${result}`}
                download="reimage-cartoon.png"
                className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase px-3 py-1.5 border border-neutral-300 text-black hover:bg-black hover:text-white hover:border-black transition-all"
                style={{ fontFamily: 'var(--font-geist-mono)' }}
              >
                <Download className="w-2.5 h-2.5" />
                Export PNG
              </a>
            )}
          </div>

          {/* Result display */}
          <div className="relative flex-1 min-h-96 border border-neutral-200 bg-white flex items-center justify-center overflow-hidden">

            {!result && !loading && (
              <div className="text-center select-none p-8">
                <div className="w-14 h-14 border border-neutral-100 flex items-center justify-center mx-auto mb-5">
                  <ImageIcon className="w-5 h-5 text-neutral-200" />
                </div>
                <p className="text-xs text-neutral-300">
                  Your cartoon will appear here
                </p>
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white">
                <Loader2 className="w-7 h-7 animate-spin text-black mb-6" />
                <p
                  className="font-mono text-[10px] tracking-[0.25em] uppercase text-neutral-500 mb-1.5"
                  style={{ fontFamily: 'var(--font-geist-mono)' }}
                >
                  Generating cartoon
                </p>
                <p
                  className="font-mono text-[10px] text-neutral-300"
                  style={{ fontFamily: 'var(--font-geist-mono)' }}
                >
                  15–20 seconds
                </p>
                <div className="mt-7 w-40 h-px bg-neutral-100 relative overflow-hidden">
                  <div className="loading-bar" />
                </div>
              </div>
            )}

            {result && !loading && (
              <div className="w-full h-full p-4 flex items-center justify-center">
                {resultType === 'image' ? (
                  <img
                    src={`data:image/png;base64,${result}`}
                    alt="Cartoon result"
                    className="max-w-full max-h-[500px] object-contain"
                  />
                ) : (
                  <p
                    className="font-mono text-[10px] text-neutral-400 whitespace-pre-wrap p-4"
                    style={{ fontFamily: 'var(--font-geist-mono)' }}
                  >
                    {result}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Status strip */}
          {result && resultType === 'image' && (
            <div className="flex items-center gap-2 border border-neutral-200 bg-white px-4 py-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-black" />
              <span
                className="font-mono text-[10px] text-neutral-500 tracking-wider"
                style={{ fontFamily: 'var(--font-geist-mono)' }}
              >
                Generation complete
              </span>
            </div>
          )}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="shrink-0 h-12 border-t border-neutral-200 flex items-center justify-between px-6 lg:px-10">
        <span
          className="font-mono text-[10px] text-neutral-300 tracking-wider"
          style={{ fontFamily: 'var(--font-geist-mono)' }}
        >
          © 2025 ReImage Agent
        </span>
        <a
          href="https://github.com/DahamDissanayake/ReImage-Agent"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[10px] text-neutral-400 hover:text-black transition-colors tracking-wider"
          style={{ fontFamily: 'var(--font-geist-mono)' }}
        >
          GitHub ↗
        </a>
      </footer>
    </div>
  );
}
