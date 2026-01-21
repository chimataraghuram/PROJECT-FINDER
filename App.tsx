import React, { useState } from 'react';
import { SearchBar } from './components/SearchBar';
import { ProjectCard } from './components/ProjectCard';
import { searchProjects } from './services/apiService';
import { Project, SearchResult, SearchState } from './types';
import { Boxes, Sparkles, Github, ExternalLink, Linkedin, Send, User, Globe, Trees } from 'lucide-react';

type View = 'search' | 'socials' | 'portfolio';
type PlatformFilter = 'All' | 'GitHub' | 'Hugging Face' | 'Kaggle';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('search');
  const [searchState, setSearchState] = useState<SearchState>({
    isLoading: false,
    error: null,
    hasSearched: false,
  });
  const [result, setResult] = useState<SearchResult | null>(null);

  // Filtering State
  const [filterPlatform, setFilterPlatform] = useState<PlatformFilter>('All');

  const handleSearch = async (query: string) => {
    setSearchState({ isLoading: true, error: null, hasSearched: true });
    setResult(null);
    // Reset filters on new search
    setFilterPlatform('All');

    try {
      const data = await searchProjects(query);
      setResult(data);
      setSearchState({ isLoading: false, error: null, hasSearched: true });
    } catch (err: any) {
      setSearchState({
        isLoading: false,
        error: err.message || "An error occurred",
        hasSearched: true
      });
    }
  };

  // Derive Filtered Data
  const filteredProjects = result?.projects.filter(project => {
    const matchesPlatform = filterPlatform === 'All' || project.platform === filterPlatform;
    return matchesPlatform;
  }) || [];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-[#0f172a]/90 backdrop-blur-md shadow-lg transition-all">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col items-center gap-4">

          {/* Logo Section */}
          <div onClick={() => setCurrentView('search')} className="flex items-center gap-2 cursor-pointer group select-none">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg group-hover:scale-105 transition-transform duration-200 shadow-blue-500/20 shadow-lg">
              <Boxes className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Project Finder
            </span>
          </div>

          {/* Navigation Menu Card */}
          <nav className="flex items-center p-1 bg-gray-800/60 border border-gray-700/60 rounded-full shadow-xl backdrop-blur-sm overflow-hidden overflow-x-auto max-w-full">
            <button
              onClick={() => setCurrentView('search')}
              className={`px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-medium transition-all focus:outline-none whitespace-nowrap ${currentView === 'search'
                ? 'bg-gray-700 text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
            >
              Project Finder
            </button>

            <div className="w-px h-4 md:h-5 bg-gray-700 mx-1 shrink-0"></div>

            <button
              onClick={() => setCurrentView('socials')}
              className={`px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-medium transition-all focus:outline-none flex items-center gap-2 whitespace-nowrap ${currentView === 'socials'
                ? 'bg-gray-700 text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
            >
              Social Media
            </button>

            <div className="w-px h-4 md:h-5 bg-gray-700 mx-1 shrink-0"></div>

            <a
              href="https://chimataraghuram.github.io/PORTFOLIO/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-medium transition-all focus:outline-none flex items-center gap-2 whitespace-nowrap text-gray-400 hover:text-white hover:bg-gray-700/50"
            >
              Publisher Portfolio
            </a>
          </nav>
        </div>
      </header>

      <main className="pb-20">

        {currentView === 'search' && (
          /* SEARCH VIEW */
          <>
            {/* Hero Section */}
            <section className={`transition-all duration-700 ease-in-out ${searchState.hasSearched ? 'py-8 md:py-10' : 'py-16 md:py-24'}`}>
              <div className="text-center mb-8 md:mb-10 space-y-4 px-4">
                {!searchState.hasSearched && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-4 animate-fade-in">
                    <Sparkles className="w-3 h-3" />
                    <span>Projects • Datasets • Models</span>
                  </div>
                )}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight">
                  Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Resources</span>
                </h1>
                <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto px-2">
                  Search for projects, datasets, and files across <span className="text-white font-medium">GitHub</span>, <span className="text-[#FFD21E] font-medium">Hugging Face</span>, and <span className="text-[#20BEFF] font-medium">Kaggle</span>.
                </p>
              </div>

              <SearchBar onSearch={handleSearch} isLoading={searchState.isLoading} />
            </section>

            {/* Results Section */}
            {searchState.error && (
              <div className="max-w-3xl mx-auto px-4 mb-12">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-300 text-center text-sm md:text-base">
                  {searchState.error}
                </div>
              </div>
            )}

            {result && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 md:space-y-12 animate-fade-in-up">

                {/* Project Grid - FIRST */}
                <div>
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-white pl-1 border-l-4 border-blue-500">
                      Found Resources ({filteredProjects.length})
                    </h2>

                    {/* Filter Controls */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Platform Filter */}
                      <div className="bg-gray-800/50 p-1 rounded-lg border border-gray-700 flex flex-wrap gap-1">
                        {(['All', 'GitHub', 'Hugging Face', 'Kaggle'] as PlatformFilter[]).map((p) => (
                          <button
                            key={p}
                            onClick={() => setFilterPlatform(p)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filterPlatform === p
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-gray-400 hover:text-white hover:bg-gray-700'
                              }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {filteredProjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {filteredProjects.map((project, index) => (
                        <ProjectCard key={`${project.name}-${index}`} project={project} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500 bg-gray-900/50 rounded-xl border border-dashed border-gray-700">
                      <p>No projects match your current filters.</p>
                      <button
                        onClick={() => { setFilterPlatform('All'); }}
                        className="mt-2 text-blue-400 hover:underline text-sm"
                      >
                        Clear filters
                      </button>
                    </div>
                  )}
                </div>

                {/* Grounding Sources - SECOND */}
                {result.groundingSources.length > 0 && (
                  <div className="pt-8 border-t border-gray-800">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                      Verified Sources & Links
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {result.groundingSources.map((source, idx) => (
                        <li key={idx}>
                          <a
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 border border-gray-700 hover:border-blue-500/50 transition-all group"
                          >
                            <div className="p-1.5 bg-gray-900 rounded-md text-blue-400 group-hover:text-blue-300 shrink-0">
                              <ExternalLink className="w-4 h-4" />
                            </div>
                            <span className="text-sm text-gray-400 group-hover:text-gray-200 truncate font-medium">
                              {source.title || new URL(source.uri).hostname}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Overview & Insights - LAST */}
                {result.summary && (
                  <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
                    <h2 className="text-lg md:text-xl font-semibold text-white mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      Overview & Insights
                    </h2>
                    <p className="text-gray-300 leading-relaxed text-base md:text-lg">
                      {result.summary}
                    </p>
                  </div>
                )}

              </div>
            )}
          </>
        )}

        {/* SOCIALS VIEW */}
        {currentView === 'socials' && (
          <div className="max-w-7xl mx-auto px-4 py-16 animate-fade-in flex flex-col items-center">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Connect with Developer</h2>
              <p className="text-gray-400 text-lg">Chimata Raghuram</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/chimataraghuram/"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-[#0077b5]/10 border border-[#0077b5]/30 hover:bg-[#0077b5]/20 hover:border-[#0077b5]/60 rounded-2xl p-8 flex flex-col items-center text-center transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="bg-[#0077b5] p-4 rounded-full mb-6 shadow-lg">
                  <Linkedin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">LinkedIn</h3>
                <p className="text-[#0077b5] text-sm font-medium">Professional Network</p>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/chimataraghuram"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gray-800 border border-gray-700 hover:bg-gray-750 hover:border-gray-500 rounded-2xl p-8 flex flex-col items-center text-center transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="bg-gray-900 p-4 rounded-full mb-6 shadow-lg border border-gray-700">
                  <Github className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">GitHub</h3>
                <p className="text-gray-400 text-sm font-medium">Code Repositories</p>
              </a>

              {/* Telegram */}
              <a
                href="https://t.me/TechBoyStore"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-[#0088cc]/10 border border-[#0088cc]/30 hover:bg-[#0088cc]/20 hover:border-[#0088cc]/60 rounded-2xl p-8 flex flex-col items-center text-center transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="bg-[#0088cc] p-4 rounded-full mb-6 shadow-lg">
                  <Send className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Telegram</h3>
                <p className="text-[#0088cc] text-sm font-medium">Direct Message</p>
              </a>

              {/* Linktree */}
              <a
                href="https://linktr.ee/chimataraghuram"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-[#43e660]/10 border border-[#43e660]/30 hover:bg-[#43e660]/20 hover:border-[#43e660]/60 rounded-2xl p-8 flex flex-col items-center text-center transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="bg-[#43e660] p-4 rounded-full mb-6 shadow-lg">
                  <Trees className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Linktree</h3>
                <p className="text-[#43e660] text-sm font-medium">All Links</p>
              </a>
            </div>
          </div>
        )}

        {/* PORTFOLIO VIEW */}
        {currentView === 'portfolio' && (
          <div className="max-w-3xl mx-auto text-center py-20 animate-fade-in px-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <a
                href="https://chimataraghuram.github.io/PORTFOLIO/"
                target="_blank"
                rel="noopener noreferrer"
                className="relative bg-gray-900 border border-gray-700 hover:border-purple-500/50 rounded-3xl p-10 md:p-16 flex flex-col items-center transition-all hover:scale-[1.02]"
              >
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-6 rounded-2xl mb-8 shadow-2xl shadow-purple-500/20">
                  <Globe className="w-16 h-16 text-white" />
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Chimata Raghuram</h2>
                <p className="text-gray-400 text-lg md:text-xl max-w-lg mx-auto mb-10 leading-relaxed">
                  Explore my complete portfolio website featuring projects, internships, skills, and certifications.
                </p>
                <div className="px-8 py-3 rounded-full bg-white text-gray-900 font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg shadow-white/10">
                  Visit Official Portfolio →
                </div>
              </a>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;