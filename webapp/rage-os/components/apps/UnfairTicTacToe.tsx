'use client'
import { useState } from 'react'

export default function UnfairTicTacToe() {
  const [size, setSize] = useState(3)
  const [winTarget, setWinTarget] = useState(3)
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null))
  const [status, setStatus] = useState("Your turn (X)")
  const [gameOver, setGameOver] = useState(false)

  const getWinner = (currentBoard: (string | null)[], currentSize: number, target: number) => {
    // check rows
    for(let r=0; r<currentSize; r++) {
      for(let c=0; c<=currentSize-target; c++) {
        let p = currentBoard[r*currentSize + c];
        if(!p) continue;
        let win = true;
        for(let i=1; i<target; i++) {
          if(currentBoard[r*currentSize + c + i] !== p) { win = false; break; }
        }
        if(win) return p;
      }
    }
    // check cols
    for(let c=0; c<currentSize; c++) {
      for(let r=0; r<=currentSize-target; r++) {
        let p = currentBoard[r*currentSize + c];
        if(!p) continue;
        let win = true;
        for(let i=1; i<target; i++) {
          if(currentBoard[(r+i)*currentSize + c] !== p) { win = false; break; }
        }
        if(win) return p;
      }
    }
    // check diag (down-right)
    for(let r=0; r<=currentSize-target; r++) {
      for(let c=0; c<=currentSize-target; c++) {
        let p = currentBoard[r*currentSize + c];
        if(!p) continue;
        let win = true;
        for(let i=1; i<target; i++) {
          if(currentBoard[(r+i)*currentSize + c + i] !== p) { win = false; break; }
        }
        if(win) return p;
      }
    }
    // check diag (up-right)
    for(let r=target-1; r<currentSize; r++) {
      for(let c=0; c<=currentSize-target; c++) {
        let p = currentBoard[r*currentSize + c];
        if(!p) continue;
        let win = true;
        for(let i=1; i<target; i++) {
          if(currentBoard[(r-i)*currentSize + c + i] !== p) { win = false; break; }
        }
        if(win) return p;
      }
    }
    return null;
  }

  const expandBoard = (oldBoard: (string | null)[], oldSize: number) => {
    const newSize = oldSize + 1;
    const newBoard = Array(newSize * newSize).fill(null);
    for(let r=0; r<oldSize; r++){
      for(let c=0; c<oldSize; c++){
        newBoard[r*newSize + c] = oldBoard[r*oldSize + c];
      }
    }
    return { newBoard, newSize };
  }

  const makeComputerMove = (currentBoard: (string | null)[], currentSize: number, target: number): number => {
      let emptySpots = [];
      for(let i=0; i<currentBoard.length; i++) {
         if (!currentBoard[i]) emptySpots.push(i);
      }
      if (emptySpots.length === 0) return -1;

      // 1. check win
      for(let idx of emptySpots) {
         let temp = [...currentBoard];
         temp[idx] = 'O';
         if (getWinner(temp, currentSize, target) === 'O') return idx;
      }
      // 2. check block
      for(let idx of emptySpots) {
         let temp = [...currentBoard];
         temp[idx] = 'X';
         if (getWinner(temp, currentSize, target) === 'X') return idx;
      }
      // 3. play smartly (build contiguous lines of 'O' aggressively)
      let bestScore = -1;
      let bestMoves: number[] = [];
      const directions = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
      
      for (let idx of emptySpots) {
          let r = Math.floor(idx / currentSize);
          let c = idx % currentSize;
          let score = Math.random() * 0.5; // jitter to break ties
          
          for (let d of directions) {
              let nr = r + d[0], nc = c + d[1];
              if (nr >= 0 && nr < currentSize && nc >= 0 && nc < currentSize) {
                  let neighbor = currentBoard[nr * currentSize + nc];
                  if (neighbor === 'O') score += 2; // heavily favor connecting to own pieces
                  else if (neighbor === 'X') score += 0.3; // slightly favor boxing in the player
              }
          }
          if (score > bestScore) {
              bestScore = score;
              bestMoves = [idx];
          } else if (score === bestScore) {
              bestMoves.push(idx);
          }
      }
      return bestMoves[Math.floor(Math.random() * bestMoves.length)] ?? emptySpots[0];
  }

  const handleDrawExpansion = (b: (string | null)[], sz: number, tgt: number) => {
      setStatus("A draw? Let's extend the board...");
      const expanded = expandBoard(b, sz);
      setSize(expanded.newSize);
      setWinTarget(tgt + 1);
      setBoard(expanded.newBoard);
      setTimeout(() => { playAI(expanded.newBoard, expanded.newSize, tgt + 1); }, 1500);
  }

  const playAI = (currentBoard: (string | null)[], currentSize: number, currentTarget: number) => {
      let aiMove = makeComputerMove(currentBoard, currentSize, currentTarget);
      
      if (aiMove === -1) {
          // Board is full, AI literally cannot move without expanding
          handleDrawExpansion(currentBoard, currentSize, currentTarget);
          return;
      }

      currentBoard[aiMove] = 'O';
      setBoard([...currentBoard]);
      let w = getWinner(currentBoard, currentSize, currentTarget);
      
      if (w === 'O') {
          setStatus("O WINS! Game Over.");
          setGameOver(true);
      } else {
          if (!currentBoard.includes(null)) {
              // AI filled the absolutely last spot, causing a draw
              handleDrawExpansion(currentBoard, currentSize, currentTarget);
          } else {
              setStatus("Your turn (X)");
          }
      }
  }

  const handlePlayerMove = (index: number) => {
    if(board[index] || gameOver || !status.includes("Your turn")) return;

    let newBoard = [...board];
    newBoard[index] = 'X';
    
    let currentSize = size;
    let currentTarget = winTarget;
    
    const winner = getWinner(newBoard, currentSize, currentTarget);
    
    if (winner === 'X') {
        setStatus(`Wait, extending canvas... You need ${currentTarget + 1} in a row now.`);
        const expanded = expandBoard(newBoard, currentSize);
        newBoard = expanded.newBoard;
        currentSize = expanded.newSize;
        currentTarget += 1;
        
        setSize(currentSize);
        setWinTarget(currentTarget);
        setBoard(newBoard);
        
        setTimeout(() => {
            playAI(newBoard, currentSize, currentTarget);
        }, 1500);
        return;
    }

    setBoard(newBoard);
    setStatus("Thinking...");
    
    setTimeout(() => {
        playAI(newBoard, currentSize, currentTarget);
    }, 500);
  }

  const resetGame = () => {
      setSize(3);
      setWinTarget(3);
      setBoard(Array(9).fill(null));
      setGameOver(false);
      setStatus("Your turn (X)");
  }

  return (
    <div className="w-full h-full flex flex-col bg-white text-black p-4 font-sans overflow-hidden">
      <div className="flex-none mb-4 text-center">
          <h2 className="font-bold text-xl mb-1">Tic Tac Toe</h2>
          <p className="text-sm font-medium h-6 flex items-center justify-center text-red-600 whitespace-pre-wrap">{status}</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center min-h-0 relative w-full h-full">
          {/* Dynamic grid container */}
          <div 
              className="grid w-full h-full max-w-full max-h-full aspect-square transition-all duration-500 ease-in-out"
              style={{
                  gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
                  gap: size > 5 ? '2px' : '4px'
              }}
          >
            {board.map((cell, idx) => (
                <button
                    key={idx}
                    onClick={() => handlePlayerMove(idx)}
                    disabled={!!cell || gameOver || !status.includes("Your turn")}
                    className={`bg-gray-100 border border-gray-300 rounded-md sm:rounded-xl ${size > 5 ? 'text-lg' : size > 4 ? 'text-xl' : 'text-3xl'} font-bold flex items-center justify-center transition-all ${
                        !cell && !gameOver && status.includes("Your turn") ? 'hover:bg-blue-50 cursor-pointer' : ''
                    } ${
                        cell === 'X' ? 'text-blue-500' : 'text-red-500'
                    }`}
                >
                    {cell}
                </button>
            ))}
          </div>
      </div>

      <div className="flex-none mt-2 flex justify-center">
          <button 
              onClick={resetGame}
              className="bg-black text-white px-6 py-2 rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
              Restart Game
          </button>
      </div>
    </div>
  )
}