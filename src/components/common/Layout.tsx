import { motion } from 'framer-motion';
import type { FC } from 'react';
import { Outlet } from 'react-router-dom';

export const Layout: FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50" />
      <div className="relative z-10">
        <Outlet />
      </div>
    </motion.div>
  );
};
