import React, { useState } from 'react';

export default function ContributionArtModule() {
  const [viewMode, setViewMode] = useState('2d'); // '2d' or '3d'
  
  // Generate mock contribution data (52 weeks x 7 days)
  const generateData = () => {
    const days = [];
    for (let i = 0; i < 364; i++) {
      days.push(Math.floor(Math.random() * 5)); // 0 to 4 intensity
    }
    return days;
  };
  
  const [contributions] = useState(generateData());

  const getColor = (level) => {
    const colors = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
    return colors[level] || colors[0];
  };

  return (
    <div className="p-8 rounded-xl border border-[#30363d] bg-[#0d1117] animate-fadeIn">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Contribution Art Matrix</h2>
          <p className="text-sm text-gray-400 max-w-xl">
            Custom, gamified contribution graphs and heatmaps directly synchronized with your history.
          </p>
        </div>
        <div className="flex bg-[#161b22] border border-[#30363d] p-1 rounded-lg gap-1">
          <button 
            onClick={() => setViewMode('2d')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === '2d' ? 'bg-[#21262d] text-white' : 'text-gray-400'}`}
          >
            2D Flat
          </button>
          <button 
            onClick={() => setViewMode('3d')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === '3d' ? 'bg-[#21262d] text-[#388bfd]' : 'text-gray-400'}`}
          >
            3D Elevated Glass
          </button>
        </div>
      </div>
      
      <div className="mt-8 border border-[#30363d] rounded-xl p-6 bg-[#010409] relative shadow-inner overflow-hidden flex flex-col">
        {/* Top Bar Layout: Floating Year Badge */}
        <div className="absolute top-4 right-6 bg-[#21262d]/80 backdrop-blur-sm border border-[#30363d] px-3 py-1 rounded-md shadow-md z-10">
          <span className="text-xs font-black text-gray-300 tracking-wider">2026</span>
        </div>

        {/* Graph Area */}
        <div className="w-full flex-1 overflow-x-auto pb-4 mt-8 hide-scrollbar">
          <div className={`w-full min-w-max flex justify-between ${viewMode === '3d' ? 'perspective-[1000px] transform-style-preserve-3d pt-12 pb-16 px-8 gap-3' : 'gap-1'}`}>
            {Array.from({ length: 52 }).map((_, weekIdx) => (
              <div key={weekIdx} className={`flex flex-col ${viewMode === '3d' ? 'gap-2 transform -rotate-x-45 rotate-z-12' : 'gap-1'}`}>
                {Array.from({ length: 7 }).map((_, dayIdx) => {
                  const level = contributions[weekIdx * 7 + dayIdx];
                  if (viewMode === '3d') {
                    const height = level === 0 ? 4 : level * 14;
                    const isGlass = level > 0;
                    return (
                      <div 
                        key={dayIdx} 
                        className="w-3 relative group transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                        style={{ 
                          height: '14px',
                          transformStyle: 'preserve-3d',
                          transform: `translateZ(${height}px)`
                        }}
                      >
                        {/* 3D Box Construction */}
                        <div className="absolute w-full h-full border border-black/30 rounded-sm backdrop-blur-md" style={{ backgroundColor: getColor(level), transform: 'translateZ(0)', opacity: isGlass ? 0.9 : 0.6 }}></div>
                        {isGlass && (
                          <>
                            <div className="absolute w-full border border-black/30 backdrop-blur-md" style={{ height: `${height}px`, backgroundColor: getColor(level), filter: 'brightness(0.75)', transformOrigin: 'top', transform: 'rotateX(-90deg) translateY(-100%)', opacity: 0.8 }}></div>
                            <div className="absolute h-full border border-black/30 backdrop-blur-md" style={{ width: `${height}px`, backgroundColor: getColor(level), filter: 'brightness(0.85)', transformOrigin: 'left', transform: 'rotateY(90deg)', opacity: 0.8 }}></div>
                          </>
                        )}
                      </div>
                    );
                  } else {
                    return (
                      <div 
                        key={dayIdx} 
                        className="w-[14px] h-[14px] rounded-sm transition-colors duration-300 hover:border-white hover:scale-110 cursor-pointer border border-black/10"
                        style={{ backgroundColor: getColor(level) }}
                      />
                    );
                  }
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar Layout: Gradient Shade Scale */}
        <div className="flex justify-end items-center gap-2 mt-6 text-[10px] text-gray-400 font-bold w-full">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(level => (
              <div key={level} className="w-[14px] h-[14px] rounded-sm border border-black/20" style={{ backgroundColor: getColor(level) }}></div>
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .perspective-\\[1000px\\] { perspective: 1000px; }
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        .-rotate-x-45 { transform: rotateX(-45deg); }
        .rotate-z-12 { transform: rotateZ(12deg); }
      `}} />
    </div>
  );
}
