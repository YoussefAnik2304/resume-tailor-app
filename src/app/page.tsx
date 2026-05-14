"use client";
import React, { useState } from 'react';

// Helper to parse **bold** markdown for rendering in UI
const renderBold = (text: string) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, j) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={j} className="font-bold text-indigo-400">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

export default function Home() {
  const [jd, setJd] = useState('');
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingText, setLoadingText] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [tailoredData, setTailoredData] = useState<any>(null);
  const [error, setError] = useState('');

  const isDevelopment = process.env.NODE_ENV === 'development';

  const handleGenerate = async (withPdf: boolean) => {
    if (!jd.trim()) return;
    if (withPdf) setLoadingPdf(true);
    else setLoadingText(true);
    
    setError('');
    setPdfUrl('');
    setTailoredData(null);

    try {
      const response = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd, generatePdf: withPdf })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate resume');
      }

      if (withPdf) setPdfUrl(data.pdfUrl);
      setTailoredData(data.tailoredData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingPdf(false);
      setLoadingText(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto p-8 pt-10 md:pt-20">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 mb-4">
            Resume Tailor Engine
          </h1>
          <p className="text-neutral-400 text-lg">
            Paste a Job Description. Our intelligence will build targeted content for your CV.
          </p>
        </header>

        <div className="space-y-6 bg-neutral-900/50 p-6 md:p-8 rounded-3xl border border-neutral-800 shadow-2xl backdrop-blur-sm">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300 ml-1">
              Job Description
            </label>
            <textarea
              className="w-full h-64 md:h-80 bg-neutral-950 border border-neutral-800 rounded-2xl p-6 text-neutral-200 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none shadow-inner"
              placeholder="Paste the target job description here..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <button
              onClick={() => handleGenerate(false)}
              disabled={loadingPdf || loadingText || !jd.trim()}
              className={`w-full ${isDevelopment ? 'md:w-1/2' : ''} px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95`}
            >
              {loadingText ? 'Tailoring Engine Running...' : 'Tailor My Resume Content'}
            </button>
            {isDevelopment && (
              <button
                onClick={() => handleGenerate(true)}
                disabled={loadingPdf || loadingText || !jd.trim()}
                className="w-full md:w-1/2 px-6 py-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-semibold border border-neutral-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95"
              >
                {loadingPdf ? 'Generating PDF...' : 'Generate Local PDF'}
              </button>
            )}
          </div>
            
          {error && (
            <div className="w-full p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center">
              {error}
            </div>
          )}

          {pdfUrl && (
            <div className="mt-8 text-center animate-fade-in-up">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex px-6 py-3 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg font-bold transition-colors border border-green-500/30 items-center gap-2"
              >
                Download Tailored PDF
              </a>
            </div>
          )}
        </div>

        {/* Content Render Section */}
        {tailoredData && (
          <div className="mt-12 bg-neutral-900/80 p-8 rounded-3xl border border-neutral-800 animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-6 text-white border-b border-neutral-800 pb-4">
              Tailored Content
              <span className="block text-sm font-normal text-neutral-400 mt-1">Copy and paste these directly into your CV builder.</span>
            </h2>

            <div className="space-y-8">
              {/* Profile */}
              <div>
                <h3 className="text-indigo-400 font-semibold uppercase tracking-wider text-sm mb-3">Profile Summary</h3>
                <div className="bg-neutral-950 p-5 rounded-xl text-neutral-300 leading-relaxed border border-neutral-800">
                  {renderBold(tailoredData.profile)}
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-indigo-400 font-semibold uppercase tracking-wider text-sm mb-3">Targeted Skills</h3>
                <div className="bg-neutral-950 p-5 rounded-xl text-neutral-300 leading-relaxed border border-neutral-800">
                  {tailoredData.skills}
                </div>
              </div>

              {/* Experiences */}
              <div>
                <h3 className="text-indigo-400 font-semibold uppercase tracking-wider text-sm mb-3">Experience Bullets</h3>
                <div className="space-y-4">
                  {tailoredData.experiences?.map((exp: any, i: number) => (
                    <div key={i} className="bg-neutral-950 p-5 rounded-xl border border-neutral-800">
                      <h4 className="text-white font-bold mb-1">{exp.title} <span className="text-neutral-500 font-normal">at {exp.company}</span></h4>
                      <p className="text-sm text-neutral-500 mb-3">{exp.date}</p>
                      <ul className="list-disc pl-5 space-y-2 text-neutral-300 marker:text-indigo-500">
                        {exp.bullets?.map((bullet: string, j: number) => (
                          <li key={j}>{renderBold(bullet)}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div>
                <h3 className="text-indigo-400 font-semibold uppercase tracking-wider text-sm mb-3">Project Bullets</h3>
                <div className="space-y-4">
                  {tailoredData.projects?.map((proj: any, i: number) => (
                    <div key={i} className="bg-neutral-950 p-5 rounded-xl border border-neutral-800">
                      <h4 className="text-white font-bold mb-1">{proj.title}</h4>
                      <ul className="list-disc pl-5 space-y-2 text-neutral-300 marker:text-indigo-500 mt-2">
                        {proj.bullets?.map((bullet: string, j: number) => (
                          <li key={j}>{renderBold(bullet)}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
