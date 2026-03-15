'use client'
import { useState, useMemo } from 'react'

type Stock = {
  symbol: string
  name: string
  price: number
  change: number
  color: string
  pattern: number[] // Y-values from 0 to 100
}

const EXPERT_STOCKS: Stock[] = [
  {
    symbol: '$WOL',
    name: 'Wolf of Wall St',
    price: 142.50,
    change: 4.2,
    color: '#22c55e',
    // Very jagged, literal M symbol (like mountains / ears)
    pattern: [0, 40, 80, 100, 60, 40, 20, 40, 60, 100, 80, 40, 0]
  },
  {
    symbol: '$FML',
    name: 'Despair Inc',
    price: 18.20,
    change: -12.4,
    color: '#ef4444',
    // An actual 'L' for loss
    pattern: [100, 100, 100, 80, 60, 40, 20, 0, 0, 0, 0, 0, 0]
  },
  {
    symbol: '$SUS',
    name: 'Amogus LLC',
    price: 350.00,
    change: 1.5,
    color: '#eab308',
    // Amogus crewmate
    pattern: [
      // backpack
      20, 20, 40, 40, 40, 20, 20, // drop down to leg
      10, 10, 
      // leg 1
      0, 0, 5, 5, 
      // crotch
      10, 10, 
      // leg 2
      5, 5, 0, 0,
      10, 30, // bump up to visor
      // visor bulge out
      45, 50, 45,
      // over the head
      70, 80, 80, 70, 60,
      // back down to start
      40, 20
    ]
  },
  {
    symbol: '$DIC',
    name: 'Phallic Corp',
    price: 69.69,
    change: 6.9,
    color: '#a855f7',
    // Very explicit joke shape
    pattern: [
      0, // start
      10, 20, 15, 0, // left ball
      20, 50, 80, 90, 85, // up the shaft
      95, 100, 90, 85, // the tip
      90, 85, 80, 50, 20, // down the shaft
      0, 15, 20, 10, // right ball
      0 // end
    ]
  },
  {
    symbol: '$W',
    name: 'Dub Tech',
    price: 105.30,
    change: 8.4,
    color: '#ec4899',
    // W pattern (McDonalds)
    pattern: [
        80, 20, 0, 10, 30, 80, // left arch
        30, 10, 0, 20, 80 // right arch
    ]
  },
  {
    symbol: '$RAGE',
    name: 'RageOS Index',
    price: 0.01,
    change: -99.9,
    color: '#ef4444',
    // Looks like it's going to the moon, then instantly crashes
    pattern: [
      10, 12, 15, 18, 25, 35, 50, 70, 85, 95, 100, // TO THE MOON!
      0, 0, 1, 0, 2, 0, 0, 1, 0 // REKT
    ]
  }
];

// Helper to interpolate raw pattern into a high-res list of XY points
function getInterpolatedPoints(pattern: number[], width: number, height: number, steps: number) {
    if (!pattern || pattern.length === 0) return [];
    
    // Slight jiggle on the last points for realism
    const p = [...pattern];
    for (let i = 1; i <= Math.min(3, p.length - 1); i++) {
        p[p.length - i] += (Math.random() - 0.5) * 5;
    }

    const min = Math.min(...p);
    const max = Math.max(...p);
    const range = (max - min) === 0 ? 1 : max - min;
    
    const origPoints = p.map((val, i) => {
      const x = (i / (p.length - 1)) * width;
      const y = height - ((val - min) / range) * (height * 0.8) - (height * 0.1);
      return { x, y };
    });
    
    const res = [];
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const targetX = t * width;
      
      const idx = origPoints.findIndex(pt => pt.x >= targetX);
      if (idx <= 0) {
        res.push(origPoints[0]);
      } else {
        const p1 = origPoints[idx - 1];
        const p2 = origPoints[idx];
        const segmentT = (targetX - p1.x) / (p2.x - p1.x);
        const y = p1.y + (p2.y - p1.y) * segmentT;
        res.push({ x: targetX, y });
      }
    }
    return res;
}

const STEPS = 300;

export default function Stonks() {
  const [selectedStock, setSelectedStock] = useState<Stock>(EXPERT_STOCKS[0]);
  
  // High-speed tick for smooth animation
  const [ticks, setTicks] = useState(0);

  // Generate high-resolution path points to travel along
  const basePoints = useMemo(() => {
    return getInterpolatedPoints(selectedStock.pattern, 500, 250, STEPS);
  }, [selectedStock, Math.floor(ticks / STEPS)]); // Refresh jiggle only when starting a new cycle

  // Animation ticks
  useMemo(() => {
    if (typeof window === 'undefined') return;
    const id = setInterval(() => setTicks(t => t + 1), 30);
    return () => clearInterval(id);
  }, []);

  const currentStep = ticks % STEPS;
  // The line array representing the remaining uneaten graph
  const remainingPoints = basePoints.slice(currentStep);

  // Pacman's current position and rotation
  const pacPos = remainingPoints[0] || basePoints[basePoints.length - 1];
  const nextPos = basePoints[currentStep + 3] || basePoints[basePoints.length - 1];
  const angle = Math.atan2(nextPos.y - pacPos.y, nextPos.x - pacPos.x) * (180 / Math.PI);
  
  const isMouthOpen = (Math.floor(ticks / 5) % 2) === 0;

  // Generate the actual SVG data strings
  const pathData = remainingPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
  const pathFillData = remainingPoints.length > 0 ? `${pathData} L 500,250 L ${remainingPoints[0].x},250 Z` : '';



  return (
    <div className="flex bg-[#1e1e1e] text-white font-sans w-[800px] h-[500px] overflow-hidden rounded-lg shadow-xl border border-[#333]">
      {/* Sidebar List */}
      <div className="w-64 bg-[#121212] border-r border-[#333] flex flex-col pt-2">
        <div className="px-4 py-3 border-b border-[#333]">
          <h2 className="text-xl font-bold text-white tracking-widest uppercase">STONKS</h2>
          <p className="text-[10px] text-gray-400">Not financial advice.</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {EXPERT_STOCKS.map(stock => (
            <div 
              key={stock.symbol}
              onClick={() => setSelectedStock(stock)}
              className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#2a2a2a] transition-colors ${selectedStock.symbol === stock.symbol ? 'bg-[#2a2a2a] border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
            >
              <div>
                <div className="font-bold text-sm tracking-wide">{stock.symbol}</div>
                <div className="text-xs text-gray-500 truncate w-24">{stock.name}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono">${stock.price.toFixed(2)}</div>
                <div className={`text-xs font-mono font-bold ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.change}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="flex-1 flex flex-col bg-[#1e1e1e] p-6 relative">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-1">{selectedStock.symbol}</h1>
          <h2 className="text-gray-400 text-lg mb-4">{selectedStock.name}</h2>
          
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-mono">${selectedStock.price.toFixed(2)}</span>
            <span className={`text-xl font-mono font-bold ${selectedStock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change}% Today
            </span>
          </div>
        </div>

        {/* The SVG Chart */}
        <div className="flex-1 w-full bg-[#1a1a1a] rounded-xl border border-[#333] p-4 relative overflow-hidden flex items-end">
          
          {/* Grid lines mock */}
          <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-10">
            {[1,2,3,4,5].map(i => <div key={i} className="w-full h-px bg-white/50" />)}
          </div>

          <svg className="w-full h-full" preserveAspectRatio="none">
            {/* Gradient fill underneath */}
            <defs>
              <linearGradient id={`gradient-${selectedStock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={selectedStock.color} stopOpacity="0.4" />
                <stop offset="100%" stopColor={selectedStock.color} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            
            {/* Fill path (only for uneaten portion) */}
            {pathFillData && (
                <path 
                    d={pathFillData} 
                    fill={`url(#gradient-${selectedStock.symbol})`} 
                />
            )}
            
            {/* Line path (The remaining dots acting as the graph) */}
            {pathData && (
                <path 
                    d={pathData} 
                    fill="none" 
                    stroke={selectedStock.color} 
                    strokeWidth="4" 
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeDasharray="8 8" 
                    className="drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                />
            )}

            {/* Pac-Man executing the graph line */}
            <g transform={`translate(${pacPos.x}, ${pacPos.y}) rotate(${angle})`}>
                <path 
                    d={isMouthOpen 
                        ? "M 0,0 L 15,-12 A 20 20 0 1 0 15,12 Z" // open mouth
                        : "M 0,0 L 20,-2 A 20 20 0 1 0 20,2 Z"   // closed mouth
                    } 
                    fill="#eab308" 
                    className="drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]"
                />
                <circle cx="-3" cy="-10" r="2" fill="black" /> {/* Pacman's eye */}
            </g>
          </svg>
        </div>

        {/* Fake Buy/Sell Buttons */}
        <div className="mt-8 flex gap-4">
          <button className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]">
            BUY
          </button>
          <button className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]">
            SELL
          </button>
        </div>
      </div>
    </div>
  )
}
