import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getStoredGames, saveGames, getFavorites, saveFavorites, downloadAllGamesAsJSON } from './utils/gameStorage.js';
import { Navbar } from './components/Navbar.jsx';
import { GameCard } from './components/GameCard.jsx';
import { GamePlayer } from './components/GamePlayer.jsx';
import { JsonViewerModal } from './components/JsonViewerModal.jsx';
import { AddGameModal } from './components/AddGameModal.jsx';
import { Search, Plus, FileCode } from 'lucide-react';

export default function App() {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [inspectingGame, setInspectingGame] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStealthActive, setIsStealthActive] = useState(false);

  const fileInputRef = useRef(null);

  // Initialize games and favorites
  useEffect(() => {
    const loaded = getStoredGames();
    setGames(loaded);
    setFavorites(getFavorites());
  }, []);

  // Stealth Cloak effect
  useEffect(() => {
    const originalTitle = 'Unblocked Games Hub';
    if (isStealthActive) {
      document.title = 'Google Docs';
      let link = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico';
    } else {
      document.title = originalTitle;
      const link = document.querySelector("link[rel*='icon']");
      if (link) {
        link.href = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎮</text></svg>';
      }
    }
  }, [isStealthActive]);

  // Categories list
  const categories = useMemo(() => {
    const cats = new Set(['All']);
    games.forEach(g => {
      if (g.category) cats.add(g.category);
    });
    return Array.from(cats);
  }, [games]);

  // Filtered games
  const filteredGames = useMemo(() => {
    return games.filter(g => {
      // Favorites filter
      if (showFavoritesOnly && !favorites.includes(g.id)) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'All' && g.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = g.title.toLowerCase().includes(q);
        const matchDesc = g.description.toLowerCase().includes(q);
        const matchTags = g.tags.some(t => t.toLowerCase().includes(q));
        const matchCat = g.category.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchTags && !matchCat) {
          return false;
        }
      }
      return true;
    });
  }, [games, selectedCategory, searchQuery, showFavoritesOnly, favorites]);

  // Handlers
  const handleToggleFavorite = (gameId) => {
    setFavorites(prev => {
      const next = prev.includes(gameId) ? prev.filter(id => id !== gameId) : [...prev, gameId];
      saveFavorites(next);
      return next;
    });
  };

  const handleAddGame = (newGame) => {
    const updated = [newGame, ...games];
    setGames(updated);
    saveGames(updated);
    setSelectedGame(newGame);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        const parsed = JSON.parse(text);

        if (Array.isArray(parsed)) {
          // Array of games
          const merged = [...parsed, ...games];
          setGames(merged);
          saveGames(merged);
          alert(`Imported ${parsed.length} games from JSON!`);
        } else if (parsed.games && Array.isArray(parsed.games)) {
          // Catalog JSON format
          const merged = [...parsed.games, ...games];
          setGames(merged);
          saveGames(merged);
          alert(`Imported catalog with ${parsed.games.length} games!`);
        } else if (parsed.title) {
          // Single game JSON
          handleAddGame(parsed);
          alert(`Game "${parsed.title}" added successfully!`);
        } else {
          alert('Unrecognized JSON format. Expected game object or games list.');
        }
      } catch (err) {
        alert('Failed to import JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Hidden file input for JSON import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportFile}
        accept=".json"
        className="hidden"
      />

      {/* Global Navigation Header */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categories={categories}
        favoritesCount={favorites.length}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavoritesOnly={() => setShowFavoritesOnly(prev => !prev)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onExportAll={() => downloadAllGamesAsJSON(games)}
        onImportClick={() => fileInputRef.current?.click()}
        onToggleStealth={() => setIsStealthActive(prev => !prev)}
        isStealthActive={isStealthActive}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {selectedGame ? (
          /* Single Game Iframe Player */
          <GamePlayer
            game={selectedGame}
            isFavorite={favorites.includes(selectedGame.id)}
            onBack={() => setSelectedGame(null)}
            onToggleFavorite={handleToggleFavorite}
            onInspectJson={setInspectingGame}
            allGames={games}
            onSelectGame={setSelectedGame}
          />
        ) : (
          /* Games Catalog View */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Top Hub Info Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-900/60 border border-slate-800/80 shadow-md">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h2 className="text-lg font-extrabold text-white tracking-tight">
                    {showFavoritesOnly
                      ? 'Your Favorite Games'
                      : selectedCategory === 'All'
                      ? 'All Unblocked Games'
                      : `${selectedCategory} Games`}
                  </h2>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                    {filteredGames.length}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Each game runs inside a sandboxed HTML5 iframe defined directly through JSON specifications.
                </p>
              </div>

              {/* JSON Catalog Quick Info */}
              <div className="flex items-center gap-2 text-xs">
                <button
                  id="view-catalog-json-btn"
                  onClick={() => downloadAllGamesAsJSON(games)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium flex items-center gap-1.5 transition-all"
                >
                  <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download Catalog JSON</span>
                </button>
              </div>
            </div>

            {/* Empty State */}
            {filteredGames.length === 0 && (
              <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/40 p-8 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-200">No games found</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    {searchQuery
                      ? `No games matching "${searchQuery}". Try searching for another keyword or clear filters.`
                      : 'No games in this category yet.'}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all"
                    >
                      Clear Search
                    </button>
                  )}
                  {showFavoritesOnly && (
                    <button
                      onClick={() => setShowFavoritesOnly(false)}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all"
                    >
                      Show All Games
                    </button>
                  )}
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add JSON Game
                  </button>
                </div>
              </div>
            )}

            {/* Games Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredGames.map(game => (
                <GameCard
                  key={game.id}
                  game={game}
                  isFavorite={favorites.includes(game.id)}
                  onSelectGame={setSelectedGame}
                  onToggleFavorite={handleToggleFavorite}
                  onInspectJson={setInspectingGame}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Unblocked Games Hub</span>
            <span>•</span>
            <span>Sandboxed Iframe Architecture</span>
            <span>•</span>
            <span className="text-emerald-400 font-mono">Zero AI Features</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Stored as JSON files</span>
            <span>•</span>
            <button
              onClick={() => downloadAllGamesAsJSON(games)}
              className="hover:text-emerald-400 underline transition-colors"
            >
              Export JSON File
            </button>
            <span>•</span>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="hover:text-emerald-400 underline transition-colors"
            >
              Add New Game
            </button>
          </div>
        </div>
      </footer>

      {/* JSON Viewer Modal */}
      <JsonViewerModal
        game={inspectingGame}
        onClose={() => setInspectingGame(null)}
      />

      {/* Add / Import Game Modal */}
      <AddGameModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddGame={handleAddGame}
      />
    </div>
  );
}
