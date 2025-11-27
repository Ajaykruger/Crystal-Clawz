import React, { useState } from 'react';
import { generateVisualContent } from '../services/gemini';
import { Image as ImageIcon, Loader2, RefreshCcw } from 'lucide-react';

interface GeneratedImageProps {
  prompt: string;
  type: 'IMAGE' | 'VIDEO';
}

export const GeneratedImage: React.FC<GeneratedImageProps> = ({ prompt, type }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = await generateVisualContent(prompt);
      setImageUrl(url);
    } catch (err) {
      console.error("Image generation error:", err);
      setError('Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (imageUrl) {
    return (
      <div className="mt-4 relative group rounded-lg overflow-hidden border border-slate-200">
        <img src={imageUrl} alt="Generated Creative" className="w-full h-64 object-cover" />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
                onClick={handleGenerate}
                className="bg-white text-slate-900 px-4 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-slate-100 transition-colors"
            >
                <RefreshCcw size={16} /> Regenerate
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 p-6 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 flex flex-col items-center justify-center text-center">
      <div className="mb-3 p-3 bg-indigo-50 rounded-full">
        <ImageIcon className="text-indigo-600" size={24} />
      </div>
      <p className="text-sm text-slate-600 mb-4 max-w-sm line-clamp-3 italic">"{prompt}"</p>
      {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Generating {type === 'VIDEO' ? 'Storyboard' : 'Image'}...
          </>
        ) : (
          <>Visualize Concept</>
        )}
      </button>
    </div>
  );
};
