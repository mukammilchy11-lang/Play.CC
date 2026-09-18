import React from 'react';
import { Play, Star, FileCode, Gamepad2, Activity, LayoutGrid, Rocket, Plane, Grid, ShieldAlert } from 'lucide-react';

const getCategoryIcon = (iconName) => {
  switch (iconName) {
    case 'Gamepad2': return <Gamepad2 className="w-6 h-6" />;
    case 'Activity': return <Activity className="w-6 h-6" />;
    case 'LayoutGrid': return <LayoutGrid className="w-6 h-6" />;
    case 'Rocket': return <Rocket className="w-6 h-6" />;
    case 'Plane': return <Plane className="w-6 h-6" />;
    case 'Grid': return <Grid className="w-6 h-6" />;
    case 'ShieldAlert': return <ShieldAlert className="w-6 h-6" />;
    default: return <Gamepad2 className="w-6 h-6" />;
  }
};

export const GameCard = ({
  game,
  isFavorite,
  onSelectGame,
  onToggleFavorite,
  onInspectJson
}) => {
  return (
    <div
      id={`game-card-${game.id}`}
      className="group relative bg-slate-900/90 rounded-xl border border-slate-800 hover:border-slate-700 transition-all duration-200 overflow-hidden flex flex-col shadow-sm hover:shadow-xl hover:shadow-slate-950/40"
    >
      {/* Top Banner & Visual Accent */}
      <div
        className="h-32 w-full relative flex items-center justify-center overflow-hidden cursor-pointer"
        style={{
          background: `radial-gradient(circle at center, ${game.color}33 0%, #090e17 80%)`
        }}
        onClick={() => onSelectGame(game)}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg"
          style={{
            backgroundColor: `${game.color}22`,
            borderColor: `${game.color}66`,
            borderWidth: 1,
            color: game.color
          }}
        >
          {getCategoryIcon(game.iconName)}
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-300 border border-slate-700/60 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: game.color }} />
          {game.category}
        </div>

        {/* Favorite Button */}
        <button
          id={`favorite-btn-${game.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(game.id);
          }}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 text-slate-400 hover:text-amber-400 transition-all"
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
        </button>

        {/* Quick Play Overlay */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <span className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg transform translate-y-1 group-hover:translate-y-0 transition-transform">
            <Play className="w-3.5 h-3.5 fill-slate-950" /> Play Game
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3
              onClick={() => onSelectGame(game)}
              className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors cursor-pointer line-clamp-1"
            >
              {game.title}
            </h3>
            {game.isCustom && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800 font-medium">
                Custom
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
            {game.description}
          </p>
        </div>

        <div>
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {game.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-800/80 font-mono">
                #{tag}
              </span>
            ))}
          </div>

          {/* Action Row */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
            <button
              id={`play-btn-${game.id}`}
              onClick={() => onSelectGame(game)}
              className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Play
            </button>

            <button
              id={`json-inspect-btn-${game.id}`}
              onClick={() => onInspectJson(game)}
              title="Inspect game JSON specification"
              className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1 transition-all"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono text-[11px]">JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
