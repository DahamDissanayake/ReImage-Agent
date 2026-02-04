'use client';

import { useState, useRef } from 'react';
import { Upload, X, ArrowRight, Loader2, Download, Sparkles } from 'lucide-react';
import Image from 'next/image';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG).');
      return;
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-indigo-600">
            <h1 className="text-4xl font-bold tracking-tight">ReImage Agent</h1>
          </div>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Transform your portraits into high-quality cartoons using AI.
            Upload a photo and let the magic happen.
          </p>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Left Column: Upload */}
          <section className="space-y-6">
            <div
              className={clsx(
                "relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ease-in-out flex flex-col items-center justify-center text-center gap-4 min-h-[400px] bg-white shadow-sm hover:shadow-md",
                isDragging ? "border-indigo-500 bg-indigo-50/50 scale-[1.01]" : "border-slate-200",
                error && "border-red-300 bg-red-50/30"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*"
              />

              {!preview ? (
                <>
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-2">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-slate-800">Upload your photo</h3>
                    <p className="text-slate-400 text-sm">Drag and drop or click to browse</p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-colors shadow-lg shadow-indigo-200"
                  >
                    Select File
                  </button>
                  <p className="text-xs text-slate-400 mt-4">Supports JPG, PNG (Max 5MB)</p>
                </>
              ) : (
                <div className="relative w-full h-full min-h-[350px] flex items-center justify-center bg-slate-100 rounded-xl overflow-hidden group">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={clearFile}
                      className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!file || loading}
              className={twMerge(
                "w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-xl",
                !file || loading
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 text-white transform hover:-translate-y-0.5"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Cartoon
                </>
              )}
            </button>
          </section>

          {/* Right Column: Result */}
          <section className="bg-white rounded-2xl border border-slate-200 p-8 min-h-[400px] shadow-sm flex flex-col">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-8 bg-indigo-500 rounded-full" />
                Result
              </h2>
              {result && resultType === 'image' && (
                <a
                  href={`data:image/png;base64,${result}`}
                  download="cartoon-result.png"
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
                >
                  <Download className="w-4 h-4" /> Download
                </a>
              )}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center border border-slate-100 rounded-xl bg-slate-50 overflow-hidden relative">
              {!result && !loading && (
                <div className="text-center text-slate-400 p-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                  <p>Processed image will appear here</p>
                </div>
              )}

              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10 space-y-4">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                  <p className="text-indigo-600 font-medium animate-pulse">Creating masterpiece...</p>
                  <p className="text-xs text-slate-400">This may take about 15-20 seconds...</p>
                </div>
              )}

              {result && (
                <div className="w-full h-full p-4 overflow-auto flex items-center justify-center">
                  {resultType === 'image' ? (
                    <div className="relative w-full h-full min-h-[300px]">

                      <img
                        src={`data:image/png;base64,${result}`}
                        alt="Result"
                        className="w-full h-auto rounded-lg shadow-md object-contain max-h-[500px]"
                      />
                    </div>
                  ) : (
                    <div className="prose prose-slate max-w-none w-full">
                      <p className="whitespace-pre-wrap">{result}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer Credits */}
        <footer className="text-center text-slate-400 text-sm mt-12 pb-6">
          <p>
            Powered by Gemini & Imagen. Created by{' '}
            <a
              href="https://github.com/DahamDissanayake/ReImage-Agent"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-500 hover:text-indigo-600 font-medium underline-offset-4 hover:underline transition-colors"
            >
              DAMA
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
