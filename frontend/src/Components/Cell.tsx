import React from 'react';
import { motion } from 'framer-motion'; // Ensure framer-motion is installed

interface CellProps {
  value: string;
  onClick: () => void;
  highlight: boolean;
}

const Cell: React.FC<CellProps> = ({ value, onClick, highlight }) => {
  return (
    <div
      className={`w-14 h-14 rounded-full bg-purple-500 cursor-pointer flex items-center justify-center ${
        highlight ? 'ring-4 ring-green-400' : ''
      }`}
      onClick={onClick}
    >
      {value && (
        <motion.div
          initial={{ y: -100 }} // Start position of the disc
          animate={{ y: 0 }} // End position after the animation
          transition={{ type: 'spring', stiffness: 100 }}
          className={`w-14 h-14 rounded-full bg-white flex items-center justify-center`}
        >
          <div
            className={`w-12  h-12 rounded-full ${
              value === 'Red' ? 'bg-red-500' : 'bg-yellow-400'
            } shadow-md`}
          ></div>
        </motion.div>
      )}
    </div>
  );
};

export default Cell;
