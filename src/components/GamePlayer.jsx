import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, RotateCcw, Maximize2, Minimize2, ExternalLink, 
  FileCode, Star, Keyboard, Info, Check, Copy, Download 
} from 'lucide-react';
import { downloadGameAsJSON } from '../utils/gameStorage.js';

export const GamePlayer = ({
  game,
  isFavorite,
  onBack,
  onToggleFavorite,
  onInspectJson,
  allGames,
  onSelectGame
}) => {
  const [reloadKey, setReloadKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('controls');
  const [copied, setCopied] = useState(false);
  const playerContainerRef = useRef(null);

  const handleReload = () => {
    setReloadKey(prev => prev + 1);
  };

  const handleToggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => {
        console.error('Error attempting to exit fullscreen:', err);
      });
      setIsFullscreen(false);
    }
  };

  // Listen to fullscreen changes (e.g. user presses Esc)
  React.useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleOpenStealthWindow = () => {
    // Classic unblocked games cloaking: open about:blank window and inject iframe
    const stealthWin = window.open('about:blank', '_blank');
    if (!stealthWin) {
      alert('Popup was blocked. Please allow popups to open stealth window.');
      return;
    }
    stealthWin.document.title = 'Google Docs';
    const doc = stealthWin.document;
    doc.body.style.margin = '0';
    doc.body.style.height = '100vh';
    doc.body.style.overflow = 'hidden';
    doc.body.style.backgroundColor = '#000';

    const iframe = doc.createElement('iframe');
    iframe.style.border = 'none';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-modals allow-pointer-lock allow-forms');

    if (game.iframeType === 'srcdoc' && game.htmlContent) {
      iframe.srcdoc = game.htmlContent;
    } else if (game.src) {
      iframe.src = game.src;
    }

    doc.body.appendChild(iframe);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(game, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const otherGames = allGames.filter(g => g.id !== game.id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            id="back-to-catalog-btn"
            onClick={onBack}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Catalog
          </button>
          <div className="hidden sm:block">
            <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-400 font-mono border border-slate-700">
              {game.category}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Favorite */}
          <button
            id="player-fav-btn"
            onClick={() => onToggleFavorite(game.id)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>

          {/* Reload Game */}
          <button
            id="player-reload-btn"
            onClick={handleReload}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all"
            title="Reload game frame"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restart</span>
          </button>

          {/* Inspect JSON */}
          <button
            id="player-inspect-json-btn"
            onClick={() => onInspectJson(game)}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all"
            title="Inspect game JSON specification"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Game JSON</span>
          </button>

          {/* Stealth Tab Cloaked Popout */}
          <button
            id="player-stealth-popout-btn"
            onClick={handleOpenStealthWindow}
            className="px-3 py-2 rounded-lg bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-800 text-xs font-medium flex items-center gap-1.5 transition-all"
            title="Open in stealth about:blank window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Stealth Window</span>
          </button>

          {/* Fullscreen */}
          <button
            id="player-fullscreen-btn"
            onClick={handleToggleFullscreen}
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-all"
            title="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Game Display Container */}
      <div
        ref={playerContainerRef}
        className={`relative bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col items-center justify-center ${
          isFullscreen ? 'w-full h-screen fixed inset-0 z-50 rounded-none border-0' : 'aspect-video min-h-[480px] max-h-[720px]'
        }`}
      >
        {/* The Sandboxed Game Iframe */}
        <iframe
          key={reloadKey}
          id="game-frame"
          title={game.title}
          srcDoc={game.iframeType === 'srcdoc' ? game.htmlContent : undefined}
          src={game.iframeType === 'url' ? game.src : undefined}
          sandbox="allow-scripts allow-same-origin allow-modals allow-pointer-lock allow-forms"
          className="w-full h-full border-none bg-slate-950"
          allow="autoplay; fullscreen; keyboard"
        />
      </div>

      {/* Details & Panels Below Game */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm space-y-4">
        {/* Title & Metadata */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              {game.title}
              <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                JSON IFRAME
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">{game.description}</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
            <button
              id="tab-controls-btn"
              onClick={() => setActiveTab('controls')}
              className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'controls' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" /> Controls
            </button>
            <button
              id="tab-info-btn"
              onClick={() => setActiveTab('info')}
              className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'info' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Info className="w-3.5 h-3.5" /> Instructions
            </button>
            <button
              id="tab-json-btn"
              onClick={() => setActiveTab('json')}
              className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'json' ? 'bg-slate-900 text-amber-400 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" /> JSON Spec
            </button>
          </div>
        </div>

        {/* Tab 1: Controls */}
        {activeTab === 'controls' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {game.controls.map((ctrl, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/60 border border-slate-800">
                <span className="text-xs text-slate-300 font-medium">{ctrl.action}</span>
                <kbd className="px-2.5 py-1 rounded bg-slate-900 text-emerald-400 font-mono text-xs border border-slate-700 shadow-inner">
                  {ctrl.key}
                </kbd>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Instructions */}
        {activeTab === 'info' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/40 p-3.5 rounded-lg border border-slate-800">
              {game.instructions}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-xs text-slate-400">Tags:</span>
              {game.tags.map(t => (
                <span key={t} className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  #{t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: JSON Spec */}
        {activeTab === 'json' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                Storage Payload: <strong className="text-slate-200">public/data/games.json → {game.id}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  id="tab-copy-json-btn"
                  onClick={handleCopyJson}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
                <button
                  id="tab-download-json-btn"
                  onClick={() => downloadGameAsJSON(game)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1 transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Download .json
                </button>
              </div>
            </div>

            <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs overflow-x-auto max-h-60 scrollbar-thin">
              <code>{JSON.stringify({
                id: game.id,
                title: game.title,
                category: game.category,
                description: game.description,
                instructions: game.instructions,
                controls: game.controls,
                tags: game.tags,
                color: game.color,
                iframeType: game.iframeType,
                htmlContentLength: game.htmlContent ? `${game.htmlContent.length} chars` : undefined,
                src: game.src
              }, null, 2)}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Quick Play More Games Carousel */}
      {otherGames.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Play Another Game</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {otherGames.slice(0, 6).map(og => (
              <button
                key={og.id}
                id={`quick-game-${og.id}`}
                onClick={() => onSelectGame(og)}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all text-left flex flex-col justify-between group"
              >
                <div
                  className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center font-bold text-xs"
                  style={{ backgroundColor: `${og.color}22`, color: og.color }}
                >
                  {og.title.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 line-clamp-1">
                    {og.title}
                  </h4>
                  <span className="text-[10px] text-slate-500">{og.category}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
