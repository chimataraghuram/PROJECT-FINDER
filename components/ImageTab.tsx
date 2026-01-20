import React, { useState } from 'react';
import { generateImage } from '../services/apiService';
import { Image as ImageIcon, Loader2, Download, AlertCircle } from 'lucide-react';

export const ImageTab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    // Image generation requires an API key
    // This feature is not available in the free version

    setIsLoading(true);
    setError(null);
    setImageSrc(null);

    try {
      const result = await generateImage(prompt, size);
      setImageSrc(result);
    } catch (err: any) {
      setError(err.message || "Failed to generate image.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Controls */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-purple-400" />
            Image Generator
          </h2>
          <p className="text-gray-400 text-sm">
            Generate high-quality AI images. This feature requires an API key.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A futuristic robot painting a canvas in a neon city..."
            className="w-full h-32 bg-gray-800 text-white placeholder-gray-500 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-gray-700 resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Image Resolution</label>
          <div className="flex gap-4">
            {(['1K', '2K', '4K'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all border ${
                  size === s
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isLoading}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              Generate Image
            </>
          )}
        </button>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-300 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 flex items-center justify-center p-4 min-h-[400px] lg:h-auto relative overflow-hidden">
        {isLoading ? (
          <div className="text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto">
               <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-400 animate-pulse">Creating masterpiece...</p>
          </div>
        ) : imageSrc ? (
          <div className="relative group w-full h-full flex items-center justify-center">
            <img 
              src={imageSrc} 
              alt="Generated" 
              className="max-w-full max-h-full rounded-lg shadow-2xl object-contain"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
              <a 
                href={imageSrc} 
                download={`ai-image-${Date.now()}.png`}
                className="p-3 bg-white text-gray-900 rounded-full hover:scale-110 transition-transform"
                title="Download"
              >
                <Download className="w-6 h-6" />
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-600">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>Your creation will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};