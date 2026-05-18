import React from 'react';

export default function ContributionArtModule() {
  return (
    <div className="p-8 rounded-xl border border-[#30363d] bg-[#0d1117] animate-fadeIn">
      <h2 className="text-2xl font-bold text-white mb-4">Contribution Art Matrix</h2>
      <p className="text-sm text-gray-400 max-w-xl">
        This module will allow you to generate custom, gamified contribution graphs and
        heatmaps directly synchronized with your GitHub history.
      </p>
      
      <div className="mt-8 border border-dashed border-[#30363d] rounded-xl p-12 flex flex-col items-center justify-center text-center bg-[#161b22]/50">
        <i className="fas fa-brush text-4xl text-[#388bfd] mb-4"></i>
        <h3 className="text-white font-bold mb-2">Coming in Phase 3</h3>
        <p className="text-gray-500 text-sm max-w-sm">The 3D isometric GitHub graph visualizer is currently being developed.</p>
      </div>
    </div>
  );
}
