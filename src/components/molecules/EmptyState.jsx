import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const EmptyState = ({ 
  title = 'No data found',
  description = 'Get started by adding your first item',
  actionLabel,
  onAction,
  icon = 'Package',
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-12 ${className}`}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mb-4"
      >
        <ApperIcon name={icon} size={32} className="text-surface-400" />
      </motion.div>
      <h3 className="text-lg font-medium text-surface-900 mb-2">{title}</h3>
      <p className="text-surface-600 text-center mb-6 max-w-md">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};

export default EmptyState;