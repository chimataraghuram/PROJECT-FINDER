with open("components/TrendingProjects.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

start_str = '<div className="flex flex-col items-center gap-8 mb-16">'
end_str = '</div>\n\n            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">'

start_idx = content.find(start_str)
end_idx = content.find(end_str, start_idx) + len('</div>')

new_block = """<div className="w-full max-w-4xl mx-auto mb-16 group">
                <div className="relative p-[1px] rounded-[2rem] md:rounded-full bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-orange-500/30 shadow-2xl transition-all duration-500 hover:from-purple-500/50 hover:via-pink-500/50 hover:to-orange-500/50">
                    <div className="absolute -inset-[1px] rounded-[2rem] md:rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
                    
                    <div className="relative flex flex-col md:flex-row items-start md:items-center bg-[#0a0a0f] rounded-[2rem] md:rounded-full p-4 md:px-6 md:py-3 w-full gap-4 md:gap-0">
                        
                        {/* 1. Platform Info */}
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="p-3 rounded-2xl bg-[#1e1b19] border border-orange-500/20 shrink-0">
                                <Flame size={20} className="text-orange-500 animate-pulse" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-medium leading-none mb-1">Trending on</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg md:text-xl font-black text-white uppercase tracking-widest leading-none">{activePlatform}</span>
                                    <TrendingUp size={16} className="text-orange-500" />
                                </div>
                            </div>
                        </div>

                        {!loading && projects.length > 0 && (
                            <>
                                <div className="hidden md:block w-px h-10 bg-white/10 mx-6 shrink-0" />
                                
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-0 w-full md:w-auto flex-1">
                                    {/* 2. Repositories Count */}
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 shrink-0">
                                            <Folder className="w-4 h-4 text-indigo-400" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-medium leading-none mb-1">Discovery</span>
                                            <span className="text-xs md:text-sm font-bold text-white uppercase tracking-wider leading-none">{projects.length} Repositories</span>
                                        </div>
                                    </div>

                                    <div className="hidden md:block w-px h-10 bg-white/10 mx-6 shrink-0" />

                                    {/* 3. Status */}
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 shrink-0">
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-medium leading-none mb-1">Status</span>
                                            <span className="text-xs md:text-sm font-bold text-green-400 uppercase tracking-wider leading-none">Updated Just Now</span>
                                        </div>
                                    </div>
                                    
                                    {/* 4. Real-Time Button */}
                                    <div className="md:ml-auto w-full md:w-auto mt-2 md:mt-0">
                                        <button className="w-full md:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:brightness-110 transition-all cursor-default">
                                            <Activity size={14} />
                                            <span>Real-Time</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>"""

if start_idx != -1:
    new_content = content[:start_idx] + new_block + content[end_idx:]
    with open("components/TrendingProjects.tsx", "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Successfully updated TrendingProjects.tsx")
else:
    print("Could not find block in TrendingProjects.tsx")
