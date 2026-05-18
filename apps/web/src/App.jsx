import React, { useState } from 'react';
import AnalyticsPreviewModule from './components/AnalyticsPreviewModule';
import ContributionArtModule from './components/ContributionArtModule';

export default function App() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [username, setUsername] = useState('JaibhagwanJindal');

  return (
    <div className="flex h-screen bg-[#010409]">
      {/* Structural Workspace Left Sidebar Controller */}
      <aside className="w-72 bg-[#0d1117] border-r border-[#30363d] p-6 flex flex-col justify-between flex-shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#388bfd] to-[#238636] flex items-center justify-center font-bold text-white text-lg shadow-md">🐙</div>
            <div>
              <h1 className="text-md font-bold text-white tracking-wide">OctoVibe</h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Set Your Profile Vibe</p>
            </div>
          </div>

          <nav className="space-y-1">
            <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'analytics' ? 'bg-[#1f3456] text-[#58a6ff]' : 'text-gray-400 hover:bg-[#161b22] hover:text-white'}`}>
              <i className="fas fa-chart-bar text-sm"></i> Analytics Workspace
            </button>
            <button onClick={() => setActiveTab('art')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'art' ? 'bg-[#1f3456] text-[#58a6ff]' : 'text-gray-400 hover:bg-[#161b22] hover:text-white'}`}>
              <i className="fas fa-palette text-sm"></i> Contribution Art
            </button>
          </nav>

          <div className="border-t border-[#21262d] pt-4">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">GitHub Account Target</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 text-sm font-mono">@</span>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="w-full bg-[#161b22] border border-[#30363d] rounded-lg pl-7 pr-3 py-2 text-sm text-white font-mono outline-none focus:border-[#58a6ff]" 
              />
            </div>
          </div>
        </div>
        <div className="text-[11px] text-gray-500 font-semibold tracking-wide">OctoVibe Core Monorepo • Phase 2 Stable</div>
      </aside>

      {/* Workspace Display Frame Router */}
      <main className="flex-1 overflow-y-auto p-10">
        {activeTab === 'analytics' ? (
          <AnalyticsPreviewModule username={username} />
        ) : (
          <ContributionArtModule />
        )}
      </main>
    </div>
  );
}
