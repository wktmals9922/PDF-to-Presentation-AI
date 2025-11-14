
import React, { useState } from 'react';
import { Presentation, Slide } from '../types';
import { ClipboardIcon, CheckIcon } from './Icons';

interface PresentationViewProps {
  presentation: Presentation;
}

const PresentationView: React.FC<PresentationViewProps> = ({ presentation }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(presentation, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg p-6 sm:p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">{presentation.title}</h2>
          <p className="text-slate-400 mt-1">{presentation.slides.length} slides generated</p>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 transition-all"
        >
          {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <ClipboardIcon className="w-5 h-5" />}
          {copied ? 'Copied!' : 'Copy JSON'}
        </button>
      </div>

      <div className="space-y-6">
        {presentation.slides.map((slide, index) => (
          <SlideCard key={index} slide={slide} index={index + 1} />
        ))}
      </div>
    </div>
  );
};

interface SlideCardProps {
    slide: Slide;
    index: number;
}

const SlideCard: React.FC<SlideCardProps> = ({slide, index}) => {
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 transition-shadow hover:shadow-cyan-500/10">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-slate-700 text-cyan-400 font-bold rounded-full">
                    {index}
                </div>
                <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-white mb-3">{slide.title}</h3>
                    <ul className="space-y-2 list-disc list-inside text-slate-300">
                        {slide.content.map((point, pointIndex) => (
                            <li key={pointIndex}>{point}</li>
                        ))}
                    </ul>
                </div>
            </div>
      </div>
    )
}

export default PresentationView;
