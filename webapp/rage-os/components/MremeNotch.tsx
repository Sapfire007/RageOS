'use client';

import { useEffect, useRef, useState } from 'react';

type Expression = 'smiling' | 'thinking' | 'shocked';

interface WSMessage {
  frame: string;
  meme: string | null;
  expression: Expression;
}

const EXPR: Record<Expression, { emoji: string; label: string }> = {
  smiling:  { emoji: '😊', label: 'Smiling'  },
  thinking: { emoji: '🤔', label: 'Thinking' },
  shocked:  { emoji: '😲', label: 'Shocked'  },
};

export default function MremeNotch() {
  const [frame, setFrame]           = useState<string | null>(null);
  const [meme, setMeme]             = useState<string | null>(null);
  const [expression, setExpression] = useState<Expression>('thinking');
  const [alive, setAlive]           = useState(false);
  const [expanded, setExpanded]     = useState(false);

  const wsRef      = useRef<WebSocket | null>(null);
  const retryRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    function connect() {
      if (cancelled) return;
      const ws = new WebSocket('ws://localhost:8765');
      wsRef.current = ws;

      ws.onopen = () => { if (!cancelled) setAlive(true); };

      ws.onmessage = (e: MessageEvent) => {
        try {
          const d: WSMessage = JSON.parse(e.data as string);
          setFrame(d.frame);
          if (d.meme) setMeme(d.meme);
          setExpression(d.expression ?? 'thinking');
        } catch { /* ignore */ }
      };

      ws.onclose = () => {
        if (cancelled) return;
        setAlive(false);
        retryRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => ws.close();
    }

    connect();
    return () => {
      cancelled = true;
      if (retryRef.current) clearTimeout(retryRef.current);
      wsRef.current?.close();
    };
  }, []);

  const cfg = EXPR[expression] ?? EXPR.thinking;

  // If not connected and no frame ever received, render nothing (don't clutter the desktop)
  if (!alive && !frame) return null;

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 z-55"
      style={{ top: 0 }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Notch pill */}
      <div
        className={`
          bg-[#0a0a0a]/95 border border-white/10 border-t-0
          rounded-b-[1.75rem] shadow-2xl
          transition-all duration-300 ease-in-out overflow-hidden
          flex flex-col items-center
          ${expanded ? 'w-105' : 'w-40'}
        `}
        style={{ backdropFilter: 'blur(20px)' }}
      >
        {/* Collapsed pill — always visible */}
        <div className="flex items-center justify-center gap-2 px-4 py-2 w-full">
          {/* Tiny meme or fallback emoji */}
          {meme ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`data:image/jpeg;base64,${meme}`}
              alt={expression}
              className="w-12 h-12 rounded-lg object-cover shrink-0"
            />
          ) : (
            <span className="text-xl leading-none">{cfg.emoji}</span>
          )}

          {/* Expression label — shown only when expanded */}
          {expanded && (
            <span className="text-white text-xs font-semibold tracking-wide truncate">
              {cfg.label}
            </span>
          )}

          {/* Live dot */}
          {alive && (
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
          )}
        </div>

        {/* Expanded content — camera + meme side by side */}
        {expanded && (
          <div className="flex gap-3 px-4 pb-4 w-full">
            {/* Camera feed */}
            <div className="flex-1 rounded-xl overflow-hidden bg-zinc-900 border border-white/10">
              {frame ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`data:image/jpeg;base64,${frame}`}
                  alt="cam"
                  className="w-full aspect-video object-cover"
                />
              ) : (
                <div className="w-full aspect-video flex items-center justify-center text-zinc-600 text-xs">
                  no feed
                </div>
              )}
            </div>

            {/* Meme thumbnail + label */}
            <div className="flex flex-col items-center justify-center gap-2 w-28">
              {meme ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`data:image/jpeg;base64,${meme}`}
                  alt={expression}
                  className="w-24 h-24 rounded-xl object-cover border border-white/10"
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-zinc-800 flex items-center justify-center text-4xl border border-white/10">
                  {cfg.emoji}
                </div>
              )}
              <span className="text-white/60 text-[10px] font-mono uppercase tracking-widest text-center">
                {cfg.label}
              </span>
              {/* Expression dots */}
              <div className="flex gap-1">
                {(['smiling', 'thinking', 'shocked'] as Expression[]).map((ex) => (
                  <span
                    key={ex}
                    className={`block h-1 rounded-full transition-all duration-300 ${
                      expression === ex ? 'w-4 bg-white' : 'w-1 bg-zinc-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
