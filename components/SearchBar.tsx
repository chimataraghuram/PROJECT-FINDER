import React, { useState, FormEvent } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex items-center bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, datasets, or models..."
            className="w-full bg-transparent text-white px-4 py-3 md:px-6 md:py-4 text-base md:text-lg focus:outline-none placeholder-gray-500 min-w-0"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-6 py-3 md:px-8 md:py-4 bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 border-l border-gray-700 transition-colors disabled:opacity-50 flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
            ) : (
              <Search className="w-5 h-5 md:w-6 md:h-6" />
            )}
          </button>
        </div>
      </form>
      
      {/* Suggestions Pills */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center text-xs md:text-sm text-gray-400">
        <span className="py-1">Try:</span>
        {['Chest X-Ray Dataset', 'Llama 3 Models', 'Titanic Solution', 'React Dashboard'].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => {
              setQuery(suggestion);
              onSearch(suggestion);
            }}
            className="hover:text-blue-400 hover:underline transition-colors cursor-pointer bg-transparent border-none p-0 py-1"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};