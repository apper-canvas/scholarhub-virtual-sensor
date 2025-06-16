import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const MetricCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  color = 'primary',
  trend = 'neutral',
  className = '' 
}) => {
  const colorMap = {
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-white',
    success: 'bg-success text-white',
    warning: 'bg-warning text-white',
    info: 'bg-info text-white'
  };

  const trendColors = {
    up: 'text-success',
    down: 'text-error',
    neutral: 'text-surface-500'
  };

  const trendIcons = {
    up: 'TrendingUp',
    down: 'TrendingDown',
    neutral: 'Minus'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-white rounded-lg p-6 shadow-sm border border-surface-200 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-surface-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-surface-900">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${trendColors[trend]}`}>
              <ApperIcon name={trendIcons[trend]} size={16} className="mr-1" />
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          <ApperIcon name={icon} size={24} />
        </div>
      </div>
    </motion.div>
  );
};

export default MetricCard;