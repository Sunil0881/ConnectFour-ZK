import React, { useState } from 'react';
import Cell from './Cell';

const ROWS = 6;
const COLS = 7;

interface Highlight {
  row: number;
  col: number;
}

const Board: React.FC = () => {
  const [board, setBoard] = useState<string[][]>(
    Array.from({ length: ROWS }, () => Array(COLS).fill(''))
  );
  const [currentPlayer, setCurrentPlayer] = useState<'Red' | 'Yellow'>('Red');
  const [winner, setWinner] = useState<string | null>(null);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [winningCells, setWinningCells] = useState<Highlight[]>([]);

  const handleClick = (colIndex: number) => {
    if (winner) return;

    for (let row = ROWS - 1; row >= 0; row--) {
      if (!board[row][colIndex]) {
        const newBoard = [...board];
        newBoard[row][colIndex] = currentPlayer;
        setBoard(newBoard);

        const result = checkWinner(newBoard, row, colIndex, currentPlayer);
        if (result.won) {
          setWinner(currentPlayer);
          setWinningCells(result.winningCells);

          // Increment the score for the winning player
          if (currentPlayer === 'Red') {
            setPlayer1Score(player1Score + 1);
          } else {
            setPlayer2Score(player2Score + 1);
          }
        } else {
          setCurrentPlayer(currentPlayer === 'Red' ? 'Yellow' : 'Red');
        }
        break;
      }
    }
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
    setCurrentPlayer('Red'); // Reset the starting player if you wish
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Player Scores */}
      <div className="flex items-center space-x-8">
        <div className="flex flex-col items-center">
          <div className="bg-white p-4 rounded-lg shadow-md text-center text-black">
            <span className="text-2xl font-bold">Player 1 (Red)</span>
            <p className="text-4xl font-extrabold mt-2">{player1Score}</p>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-white p-4 rounded-lg shadow-md text-center text-black">
            <span className="text-2xl font-bold">Player 2 (Yellow)</span>
            <p className="text-4xl font-extrabold mt-2">{player2Score}</p>
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className="relative">
        {winner && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 text-white text-3xl font-bold space-y-4">
            <p>{winner} Wins!</p>
            <button
              className="bg-green-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-green-600"
              onClick={resetBoard}
            >
              Continue
            </button>
          </div>
        )}
        <div className="grid grid-cols-7 gap-20">
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
        </div>
      </div>
    </div>
  );
};

export default Board;
