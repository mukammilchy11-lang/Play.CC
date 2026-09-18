import React, { useState } from 'react';
import { X, Upload, Code2, PlusCircle, AlertCircle, Sparkles } from 'lucide-react';

export const AddGameModal = ({ isOpen, onClose, onAddGame }) => {
  const [tab, setTab] = useState('upload');
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState(null);

  // Manual form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Arcade');
  const [description, setDescription] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [gameUrl, setGameUrl] = useState('');
  const [useUrl, setUseUrl] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        const parsed = JSON.parse(text);
        validateAndAdd(parsed);
      } catch (err) {
        setError('Invalid JSON file format: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handlePasteJsonSubmit = (e) => {
    e.preventDefault();
    try {
      setError(null);
      const parsed = JSON.parse(jsonInput);
      validateAndAdd(parsed);
    } catch (err) {
      setError('JSON parsing failed: ' + err.message);
    }
  };

  const validateAndAdd = (obj) => {
    if (!obj.title) {
      setError('Game JSON must contain at least a "title" property');
      return;
    }
    const newGame = {
      id: obj.id || `custom-${Date.now()}`,
      title: obj.title,
      category: obj.category || 'Arcade',
      description: obj.description || 'Custom user game loaded via JSON.',
      instructions: obj.instructions || 'Standard game controls.',
      controls: Array.isArray(obj.controls) ? obj.controls : [{ key: 'Default', action: 'Standard' }],
      tags: Array.isArray(obj.tags) ? obj.tags : ['custom'],
      color: obj.color || '#a855f7',
      iconName: obj.iconName || 'Gamepad2',
      iframeType: obj.iframeType || (obj.htmlContent ? 'srcdoc' : 'url'),
      htmlContent: obj.htmlContent,
      src: obj.src,
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    onAddGame(newGame);
    onClose();
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!useUrl && !htmlContent.trim()) {
      setError('Please provide HTML/JS content for the game iframe');
      return;
    }
    if (useUrl && !gameUrl.trim()) {
      setError('Please provide a game URL');
      return;
    }

    const newGame = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      category: category,
      description: description.trim() || 'Custom game loaded via JSON iframe specification.',
      instructions: 'Use standard keyboard or touch controls.',
      controls: [
        { key: 'Keys', action: 'Controls' }
      ],
      tags: ['custom', category.toLowerCase()],
      color: '#8b5cf6',
      iconName: 'Gamepad2',
      iframeType: useUrl ? 'url' : 'srcdoc',
      htmlContent: useUrl ? undefined : htmlContent,
      src: useUrl ? gameUrl.trim() : undefined,
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    onAddGame(newGame);
    onClose();
  };

  const loadSampleTemplate = () => {
    const sample = {
      id: `custom-paddle-${Date.now()}`,
      title: "Neon Bouncer",
      category: "Arcade",
      description: "A fast-paced neon reflex game created from JSON.",
      instructions: "Move mouse or finger to keep the glowing orb bouncing in the arena.",
      controls: [
        { key: "Mouse / Touch", action: "Move Shield" }
      ],
      tags: ["neon", "reflex", "arcade"],
      color: "#06b6d4",
      iconName: "Activity",
      iframeType: "srcdoc",
      htmlContent: `<!DOCTYPE html><html><body style="margin:0;background:#030712;color:#fff;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;"><canvas id="c" width="360" height="360" style="background:#090d16;border:2px solid #38bdf8;border-radius:12px;"></canvas><h3 style="color:#38bdf8;margin-top:10px;">Score: <span id="s">0</span></h3><script>const c=document.getElementById('c'),ctx=c.getContext('2d'),sEl=document.getElementById('s');let x=180,y=100,vx=3,vy=3,px=140,score=0;c.onmousemove=e=>{const r=c.getBoundingClientRect();px=e.clientX-r.left-40;};c.ontouchmove=e=>{const r=c.getBoundingClientRect();px=e.touches[0].clientX-r.left-40;e.preventDefault();};function loop(){x+=vx;y+=vy;if(x<10||x>350)vx=-vx;if(y<10)vy=-vy;if(y>330&&x>px&&x<px+80){vy=-vy;score++;sEl.innerText=score;}if(y>360){score=0;sEl.innerText=score;x=180;y=100;}ctx.fillStyle='#090d16';ctx.fillRect(0,0,360,360);ctx.fillStyle='#38bdf8';ctx.fillRect(px,340,80,10);ctx.fillStyle='#f43f5e';ctx.beginPath();ctx.arc(x,y,8,0,7);ctx.fill();requestAnimationFrame(loop);}loop();</script></body></html>`
    };
    setJsonInput(JSON.stringify(sample, null, 2));
    setTab('json');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Store Game in JSON Iframe</h3>
              <p className="text-xs text-slate-400">Import or create an unblocked game specification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-2 gap-2 text-xs">
          <button
            onClick={() => { setTab('upload'); setError(null); }}
            className={`flex-1 py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
              tab === 'upload' ? 'bg-slate-800 text-white font-bold border border-slate-700' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> Upload .JSON File
          </button>
          <button
            onClick={() => { setTab('json'); setError(null); }}
            className={`flex-1 py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
              tab === 'json' ? 'bg-slate-800 text-white font-bold border border-slate-700' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" /> Paste JSON
          </button>
          <button
            onClick={() => { setTab('manual'); setError(null); }}
            className={`flex-1 py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
              tab === 'manual' ? 'bg-slate-800 text-white font-bold border border-slate-700' : 'text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" /> Manual Creator
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-4 mt-3 p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Body Area */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {tab === 'upload' && (
            <div className="space-y-4">
              <label className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-950/40 hover:bg-slate-950/80">
                <Upload className="w-10 h-10 text-emerald-400 mb-3" />
                <span className="text-sm font-bold text-white mb-1">Click to select or drop a .JSON file</span>
                <span className="text-xs text-slate-400 max-w-sm">
                  The JSON should include game metadata and self-contained iframe htmlContent or src URL.
                </span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-800">
                <span className="text-xs text-slate-400">Need an example to get started?</span>
                <button
                  type="button"
                  onClick={loadSampleTemplate}
                  className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Load Sample JSON
                </button>
              </div>
            </div>
          )}

          {tab === 'json' && (
            <form onSubmit={handlePasteJsonSubmit} className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">
                  Game JSON Payload (Must contain title & htmlContent or src):
                </label>
                <button
                  type="button"
                  onClick={loadSampleTemplate}
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Load Sample
                </button>
              </div>
              <textarea
                value={jsonInput}
                onChange={e => setJsonInput(e.target.value)}
                placeholder='{\n  "title": "My Game",\n  "category": "Arcade",\n  "iframeType": "srcdoc",\n  "htmlContent": "<!DOCTYPE html>..."\n}'
                rows={10}
                className="w-full p-3 rounded-xl bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow"
              >
                Store & Launch Game
              </button>
            </form>
          )}

          {tab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Game Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Pixel Racer"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 text-slate-100 border border-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 text-slate-100 border border-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Arcade">Arcade</option>
                    <option value="Action">Action</option>
                    <option value="Puzzle">Puzzle</option>
                    <option value="Sports">Sports</option>
                    <option value="Retro">Retro</option>
                    <option value="Strategy">Strategy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Short description of the game..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 text-slate-100 border border-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-4 py-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-medium">
                  <input
                    type="radio"
                    name="sourceType"
                    checked={!useUrl}
                    onChange={() => setUseUrl(false)}
                    className="text-emerald-500 focus:ring-0"
                  />
                  Self-contained HTML/CSS/JS (srcdoc)
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-medium">
                  <input
                    type="radio"
                    name="sourceType"
                    checked={useUrl}
                    onChange={() => setUseUrl(true)}
                    className="text-emerald-500 focus:ring-0"
                  />
                  Direct URL
                </label>
              </div>

              {!useUrl ? (
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Game HTML/JS code for &lt;iframe srcdoc="..."&gt;
                  </label>
                  <textarea
                    value={htmlContent}
                    onChange={e => setHtmlContent(e.target.value)}
                    placeholder="<!DOCTYPE html><html><body><h1>My Game</h1><canvas id='c'></canvas><script>...</script></body></html>"
                    rows={7}
                    className="w-full p-3 rounded-xl bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Game Web URL</label>
                  <input
                    type="url"
                    value={gameUrl}
                    onChange={e => setGameUrl(e.target.value)}
                    placeholder="https://example.com/game.html"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 text-slate-100 border border-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow"
              >
                Create Game in JSON
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
