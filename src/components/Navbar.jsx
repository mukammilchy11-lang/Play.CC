import React from 'react';
import { Gamepad2, Search, Plus, Download, Upload, Eye, Star } from 'lucide-react';

export const Navbar = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  categories,
  favoritesCount,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  onOpenAddModal,
  onExportAll,
  onImportClick,
  onToggleStealth,
  isStealthActive
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      {/* Top row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { onSelectCategory('All'); }}>
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                UNBLOCKED<span className="text-emerald-400 font-bold ml-1">GAMES</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-emerald-900/60 font-semibold">
                JSON-IFRAME
              </span>
            </div>
            <p className="text-xs text-slate-400">Zero-block web games loaded from JSON specs</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex-1 max-w-md min-w-[220px]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="game-search-input"
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Search games, tags, genres..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800/90 text-sm text-slate-100 placeholder-slate-400 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Stealth Tab Cloaker */}
          <button
            id="stealth-cloak-btn"
            onClick={onToggleStealth}
            title={isStealthActive ? 'Disable stealth cloak' : 'Disguise tab as Google Docs'}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${
              isStealthActive
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/50'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isStealthActive ? 'Cloak ON' : 'Tab Cloak'}</span>
          </button>

          {/* Import JSON */}
          <button
            id="import-json-btn"
            onClick={onImportClick}
            title="Import custom game JSON file"
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import JSON</span>
          </button>

          {/* Export JSON */}
          <button
            id="export-json-btn"
            onClick={onExportAll}
            title="Export all game specs as JSON"
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Catalog</span>
          </button>

          {/* Add Game */}
          <button
            id="add-game-btn"
            onClick={onOpenAddModal}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Game</span>
          </button>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-2 overflow-x-auto border-t border-slate-800/80 scrollbar-none text-xs">
        {categories.map(cat => {
          const isActive = selectedCategory === cat && !showFavoritesOnly;
          return (
            <button
              key={cat}
              id={`filter-cat-${cat.toLowerCase()}`}
              onClick={() => {
                if (showFavoritesOnly) onToggleFavoritesOnly();
                onSelectCategory(cat);
              }}
              className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          );
        })}

        {/* Favorites filter pill */}
        <button
          id="filter-favorites-btn"
          onClick={onToggleFavoritesOnly}
          className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
            showFavoritesOnly
              ? 'bg-amber-400 text-amber-950 font-bold shadow-sm'
              : 'bg-slate-800/70 text-slate-400 hover:text-amber-300 hover:bg-slate-800'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-amber-950' : 'fill-none text-amber-400'}`} />
          <span>Favorites ({favoritesCount})</span>
        </button>
      </div>
    </header>
  );
};
