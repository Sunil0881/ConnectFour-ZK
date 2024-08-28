import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Cell from './Cell';

const ROWS = 6;
const COLS = 7;

interface Highlight {
  row: number;
  col: number;
}

const PlayerVsCPU: React.FC = () => {
  const [board, setBoard] = useState<string[][]>(
    Array.from({ length: ROWS }, () => Array(COLS).fill(''))
  );
  const [currentPlayer, setCurrentPlayer] = useState<'Red' | 'Yellow'>('Red');
  const [winner, setWinner] = useState<string | null>(null);
  const [winningCells, setWinningCells] = useState<Highlight[]>([]);

  const handleClick = (colIndex: number) => {
    if (winner || currentPlayer !== 'Red') return;

    makeMove(colIndex, 'Red');

    if (!winner) {
      setTimeout(() => makeCpuMove(), 500);
    }
  };

  const makeMove = (colIndex: number, player: 'Red' | 'Yellow') => {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (!board[row][colIndex]) {
        const newBoard = [...board];
        newBoard[row][colIndex] = player;
        setBoard(newBoard);

        const result = checkWinner(newBoard, row, colIndex, player);
        if (result.won) {
          setWinner(player);
          setWinningCells(result.winningCells);
        } else {
          setCurrentPlayer(player === 'Red' ? 'Yellow' : 'Red');
        }
        break;
      }
    }
  };

  const makeCpuMove = () => {
    // 1. Check if the CPU can win in the next move
    for (let col = 0; col < COLS; col++) {
      const tempBoard = [...board];
      if (canPlayMove(tempBoard, col)) {
        makeMove(col, 'Yellow');
        return;
      }
    }

    // 2. Block the player from winning
    for (let col = 0; col < COLS; col++) {
      const tempBoard = [...board];
      if (canPlayMove(tempBoard, col, 'Red')) {
        makeMove(col, 'Yellow');
        return;
      }
    }

    // 3. Play strategically, prioritize the center columns
    const centerColumns = [3, 2, 4, 1, 5, 0, 6]; // Prioritize the center columns first
    for (let col of centerColumns) {
      if (board[0][col] === '') {
        makeMove(col, 'Yellow');
        return;
      }
    }
  };

  const canPlayMove = (tempBoard: string[][], col: number, player: 'Red' | 'Yellow' = 'Yellow') => {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (!tempBoard[row][col]) {
        tempBoard[row][col] = player;
        const result = checkWinner(tempBoard, row, col, player);
        tempBoard[row][col] = ''; // Reset the temp board
        return result.won;
      }
    }
    return false;
  };

  const checkWinner = (
    board: string[][],
    row: number,
    col: number,
    player: string
  ): { won: boolean; winningCells: Highlight[] } => {
    const directions = [
      { rowDir: 1, colDir: 0 }, // Horizontal
      { rowDir: 0, colDir: 1 }, // Vertical
      { rowDir: 1, colDir: 1 }, // Diagonal down-right
      { rowDir: 1, colDir: -1 } // Diagonal down-left
    ];

    for (const { rowDir, colDir } of directions) {
      const result = checkDirection(board, row, col, player, rowDir, colDir);
      if (result.length >= 4) {
        return { won: true, winningCells: result };
      }
    }
    return { won: false, winningCells: [] };
  };

  const checkDirection = (
    board: string[][],
    row: number,
    col: number,
    player: string,
    rowDir: number,
    colDir: number
  ): Highlight[] => {
    let count = 0;
    const cells: Highlight[] = [];

    for (let i = -3; i <= 3; i++) {
      const newRow = row + i * rowDir;
      const newCol = col + i * colDir;
      if (
        newRow >= 0 &&
        newRow < ROWS &&
        newCol >= 0 &&
        newCol < COLS &&
        board[newRow][newCol] === player
      ) {
        count++;
        cells.push({ row: newRow, col: newCol });
        if (count === 4) return cells;
      } else {
        count = 0;
        cells.length = 0; // Clear cells array if sequence is broken
      }
    }
    return [];
  };

  const resetBoard = () => {
    setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill('')));
    setWinner(null);
    setWinningCells([]);
    setCurrentPlayer('Red'); // Player always starts first
  };

  return (
    <motion.div
      className="flex flex-col items-center bg-gradient-to-r from-purple-700 to-purple-900 justify-center h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Player Labels */}
      <div className="flex items-center space-x-8 mb-6">
        <motion.div
          className="flex flex-col items-center"
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="bg-white p-4 rounded-lg shadow-md text-center text-black">
            <span className="text-2xl font-bold">👤 Player (Red) 🔴</span>
          </div>
        </motion.div>

        <motion.div
          className="flex flex-col items-center"
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-white p-4 rounded-lg shadow-md text-center text-black">
            <span className="text-2xl font-bold">🤖 CPU (Yellow) 🟡</span>
          </div>
        </motion.div>
      </div>

      {/* Game Board */}
      <div className="relative">
        {winner && (
          <motion.div
            className="absolute z-10 inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 text-white text-3xl font-bold space-y-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <p>
              🎉 {winner} Wins! 🎉
            </p>
            <button
              className="bg-green-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-green-600"
              onClick={resetBoard}
            >
              🔄 Restart
            </button>
          </motion.div>
        )}
        <motion.div
          className="grid grid-cols-7 gap-3"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {board.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              {row.map((cell, colIndex) => (
                <Cell
                  key={colIndex}
                  value={cell}
                  onClick={() => handleClick(colIndex)}
                  highlight={winningCells.some(
                    (highlight) =>
                      highlight.row === rowIndex && highlight.col === colIndex
                  )}
                />
              ))}
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PlayerVsCPU;
