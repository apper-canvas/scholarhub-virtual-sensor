import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const ErrorState = ({ 
  message = 'Something went wrong', 
  onRetry,
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center justify-center py-12 ${className}`}
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-4"
      >
        <ApperIcon name="AlertCircle" size={32} className="text-error" />
      </motion.div>
      <h3 className="text-lg font-medium text-surface-900 mb-2">Oops! Something went wrong</h3>
      <p className="text-surface-600 text-center mb-6 max-w-md">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <ApperIcon name="RefreshCw" size={16} className="mr-2" />
          Try Again
        </Button>
      )}
    </motion.div>
  );
};

export default ErrorState;