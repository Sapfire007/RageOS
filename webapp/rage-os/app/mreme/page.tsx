'use client';

import { useEffect, useRef, useState } from 'react';

type Expression = 'smiling' | 'thinking' | 'shocked';

interface WSMessage {
  frame: string;
  meme: string | null;
  expression: Expression;
}

const EXPRESSION_CONFIG: Record<Expression, { emoji: string; label: string; glow: string }> = {
  smiling:  { emoji: '😊', label: 'Smiling',  glow: 'shadow-yellow-500/30' },
  thinking: { emoji: '🤔', label: 'Thinking', glow: 'shadow-blue-500/30'   },
  shocked:  { emoji: '😲', label: 'Shocked',  glow: 'shadow-red-500/30'    },
};

export default function MremePage() {
  const [frame, setFrame]           = useState<string | null>(null);
  const [meme, setMeme]             = useState<string | null>(null);
  const [expression, setExpression] = useState<Expression>('thinking');
  const [status, setStatus]         = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  const wsRef      = useRef<WebSocket | null>(null);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    function connect() {
      if (cancelled) return;
      setStatus('connecting');

      const ws = new WebSocket('ws://localhost:8765');
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled) { ws.close(); return; }
        setStatus('connected');
      };

      ws.onmessage = (e: MessageEvent) => {
        try {
          const data: WSMessage = JSON.parse(e.data as string);
          setFrame(data.frame);
          if (data.meme) setMeme(data.meme);
          setExpression(data.expression ?? 'thinking');
        } catch { /* ignore malformed */ }
      };

      ws.onclose = () => {
        if (cancelled) return;
        setStatus('disconnected');
        retryTimer.current = setTimeout(connect, 2000);
      };

      ws.onerror = () => ws.close();
    }

    connect();

    return () => {
      cancelled = true;
      if (retryTimer.current) clearTimeout(retryTimer.current);
      wsRef.current?.close();
    };
  }, []);

  const cfg = EXPRESSION_CONFIG[expression] ?? EXPRESSION_CONFIG.thinking;
  const connected = status === 'connected';

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center select-none">
      {/* Status pill */}
      <div className="mb-5 flex items-center gap-2.5 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5">
        <span
          className={`w-2 h-2 rounded-full ${
            connected ? 'bg-green-400 animate-pulse' : status === 'connecting' ? 'bg-yellow-400 animate-pulse' : 'bg-red-500'
          }`}
        />
        <span className="text-xs text-zinc-400 font-mono tracking-widest uppercase">
          {status === 'connecting'
            ? 'Connecting to mreme…'
            : status === 'connected'
            ? 'Live  •  ws://localhost:8765'
            : 'Disconnected — retrying…'}
        </span>
      </div>

      {/* Camera + Notch container */}
      <div className="flex flex-col items-center">
        {/* ── Camera feed ── */}
        <div
          className="w-[640px] h-[480px] bg-zinc-950 rounded-t-2xl overflow-hidden
                     border border-zinc-800 border-b-0 relative"
        >
          {frame ? (
            <img
              src={`data:image/jpeg;base64,${frame}`}
              className="w-full h-full object-cover"
              alt="Live camera"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-zinc-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 10l4.553-2.07A1 1 0 0121 8.87V15.13a1 1 0 01-1.447.9L15 14M4 8h8a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2z"
                />
              </svg>
              <p className="text-sm font-mono text-center leading-relaxed">
                {status === 'connected'
                  ? 'Waiting for frames…'
                  : 'Run  python mreme/main.py  to begin'}
              </p>
            </div>
          )}
        </div>

        {/* ── MacBook-style notch ── */}
        <div className="flex justify-center w-full">
          <div
            className={`
              bg-[#0a0a0a] border border-zinc-800 border-t-0
              rounded-b-[2.5rem] px-8 py-5
              flex items-center gap-6
              shadow-2xl ${cfg.glow}
              transition-all duration-500 ease-in-out
              min-w-[340px]
            `}
          >
            {/* Meme thumbnail */}
            <div className="relative flex-shrink-0">
              {meme ? (
                <img
                  src={`data:image/jpeg;base64,${meme}`}
                  className="w-[88px] h-[88px] rounded-2xl object-cover border border-zinc-700 shadow-lg"
                  alt={expression}
                />
              ) : (
                <div className="w-[88px] h-[88px] rounded-2xl bg-zinc-800 flex items-center justify-center text-4xl border border-zinc-700">
                  {cfg.emoji}
                </div>
              )}
              {/* Tiny expression badge */}
              <span className="absolute -bottom-2 -right-2 text-xl leading-none">
                {cfg.emoji}
              </span>
            </div>

            {/* Labels */}
            <div>
              <p className="text-white font-bold text-xl tracking-wide">{cfg.label}</p>
              <p className="text-zinc-500 text-[11px] font-mono uppercase tracking-widest mt-1">
                Expression detected
              </p>
              {/* Animated dot row */}
              <div className="flex gap-1.5 mt-3">
                {(['smiling', 'thinking', 'shocked'] as Expression[]).map((ex) => (
                  <span
                    key={ex}
                    className={`block h-1.5 rounded-full transition-all duration-300 ${
                      expression === ex ? 'w-5 bg-white' : 'w-1.5 bg-zinc-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-8 text-zinc-700 text-xs font-mono">
        mreme • mediapipe face mesh • openrouter
      </p>
    </div>
  );
}
