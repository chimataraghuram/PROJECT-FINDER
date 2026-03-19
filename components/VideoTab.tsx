import React, { useState } from 'react';
import { generateVideo } from '../services/apiService';
import { Video, Loader2, Upload, AlertCircle, Play } from 'lucide-react';

export const VideoTab: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const checkApiKey = async () => {
    // Video generation requires an API key
    // This feature is not available in the free version
    return false;
  };

  const handleGenerate = async () => {
    if (!image) {
        setError("Please upload an image first.");
        return;
    }
    
    setError(null);
    setVideoSrc(null);

    try {
      await checkApiKey();
      
      setIsLoading(true);
      setStatus("Initializing Veo model...");

      // Short delay to ensure key context is set if just selected
      setStatus("Generating video... This may take a minute.");
      const vidUrl = await generateVideo(image, prompt, aspectRatio);
      setVideoSrc(vidUrl);
      setStatus("Complete!");

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate video. This feature requires an API key.");
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
            <Video className="w-6 h-6 text-pink-400" />
            Veo Video Animator
          </h2>
          <p className="text-gray-400 text-sm">
             Bring images to life with AI video generation. <br/>
             <span className="text-pink-400 text-xs">*Requires an API key.</span>
          </p>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Source Image</label>
          <div 
            className="border-2 border-dashed border-gray-700 hover:border-pink-500/50 rounded-xl p-6 transition-colors cursor-pointer bg-gray-800/50 flex flex-col items-center justify-center h-48 relative overflow-hidden group"
            onClick={() => document.getElementById('veo-upload')?.click()}
          >
             {image ? (
               <img src={image} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
             ) : (
               <Upload className="w-8 h-8 text-gray-500 mb-2" />
             )}
             <p className="relative z-10 text-gray-300 font-medium text-sm">
               {image ? "Click to change image" : "Upload an image to animate"}
             </p>
             <input 
               id="veo-upload" 
               type="file" 
               accept="image/*" 
               className="hidden" 
               onChange={handleImageUpload}
             />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Prompt (Optional)</label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A cinematic pan, neon lights flickering..."
            className="w-full bg-gray-800 text-white placeholder-gray-500 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 border border-gray-700"
          />
        </div>

        <div className="space-y-2">
           <label className="text-sm font-medium text-gray-300">Aspect Ratio</label>
           <div className="flex gap-4">
             <button
               onClick={() => setAspectRatio('16:9')}
               className={`flex-1 py-3 rounded-lg text-sm font-semibold border ${
                 aspectRatio === '16:9' 
                   ? 'bg-pink-600 border-pink-500 text-white' 
                   : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
               }`}
             >
               Landscape (16:9)
             </button>
             <button
               onClick={() => setAspectRatio('9:16')}
               className={`flex-1 py-3 rounded-lg text-sm font-semibold border ${
                 aspectRatio === '9:16' 
                   ? 'bg-pink-600 border-pink-500 text-white' 
                   : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
               }`}
             >
               Portrait (9:16)
             </button>
           </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!image || isLoading}
          className="w-full py-4 bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-500 hover:to-orange-500 text-white rounded-xl font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {status || "Processing..."}
            </>
          ) : (
            <>
              Generate Video
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

      {/* Output */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 flex items-center justify-center p-4 min-h-[400px] lg:h-auto">
         {isLoading ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto border-4 border-gray-700 border-t-pink-500 rounded-full animate-spin"></div>
              <p className="text-gray-400 animate-pulse text-sm max-w-xs mx-auto">
                Generating video frames... this usually takes about 60-90 seconds. Please wait.
              </p>
            </div>
         ) : videoSrc ? (
            <div className="w-full h-full flex items-center justify-center">
               <video 
                 src={videoSrc} 
                 controls 
                 autoPlay 
                 loop 
                 className="max-w-full max-h-full rounded-lg shadow-2xl"
               />
            </div>
         ) : (
            <div className="text-center text-gray-600">
               <Play className="w-16 h-16 mx-auto mb-4 opacity-20" />
               <p>Your video will appear here</p>
            </div>
         )}
      </div>
    </div>
  );
};