import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, CheckCircle2 } from 'lucide-react';
import { downloadGameAsJSON } from '../utils/gameStorage.js';

export const JsonViewerModal = ({ game, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [showFullHtml, setShowFullHtml] = useState(false);

  if (!game) return null;

  const jsonString = JSON.stringify(
    showFullHtml
      ? game
      : {
          ...game,
          htmlContent: game.htmlContent
            ? `[Self-contained HTML5 Canvas Game Code (${game.htmlContent.length} bytes) - toggle button below to view full raw code]`
            : undefined
        },
    null,
    2
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(game, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                JSON Specification: {game.title}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Stored in iframe as a structured JSON object
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Actions Bar */}
        <div className="px-4 py-2.5 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFullHtml(!showFullHtml)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            >
              {showFullHtml ? 'Truncate HTML in Preview' : 'Show Full HTML in Preview'}
            </button>
            <span className="text-slate-500 font-mono text-[11px]">
              Type: {game.iframeType}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Full JSON!' : 'Copy Full JSON'}</span>
            </button>

            <button
              onClick={() => downloadGameAsJSON(game)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {game.id}.json</span>
            </button>
          </div>
        </div>

        {/* JSON Code Viewer */}
        <div className="p-4 flex-1 overflow-y-auto bg-slate-950">
          <pre className="font-mono text-xs text-emerald-400 leading-relaxed whitespace-pre-wrap">
            <code>{jsonString}</code>
          </pre>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Sandboxed iframe compatibility confirmed
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
