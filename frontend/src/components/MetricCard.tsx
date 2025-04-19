
import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface MetricCardProps {
  value: string;
  label: string;
  color: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ value, label, color, icon, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 cursor-pointer relative overflow-hidden group ${onClick ? 'hover:shadow-lg hover:shadow-blue-500/10' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`${color} p-2 rounded-lg`}>
          {icon}
        </div>
        <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
      </div>
      <div>
        <h3 className="text-2xl font-bold">{value}</h3>
        <p className="text-gray-400 text-sm">{label}</p>
      </div>
      <div className={`absolute bottom-0 left-0 w-full h-1 ${color.replace('text-', 'bg-')} opacity-30 group-hover:opacity-60 transition-opacity`}></div>
    </motion.div>
  );
};

export default MetricCard;
