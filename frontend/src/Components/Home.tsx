import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-700 to-purple-900 text-white p-4">
      <motion.h1
        className="text-5xl font-extrabold mb-12 tracking-wider"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        Connect Four 🎮
      </motion.h1>
      <motion.div
        className=" flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeIn' }}
      >
        <motion.button
          className="w-40 bg-gradient-to-r mr-2 from-blue-500 to-blue-700 text-white px-2 py-3 rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-800 transform hover:scale-105 transition-transform"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/player-vs-player')}
        >
          🤼 Player vs Player
        </motion.button>
        <motion.button
          className="w-40 ml-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white px-2 py-3 rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-800 transform hover:scale-105 transition-transform"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/player-vs-cpu')}
        >
          🤖 Player vs CPU
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Home;
