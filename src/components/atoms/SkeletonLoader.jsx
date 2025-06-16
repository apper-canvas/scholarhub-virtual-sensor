import { motion } from 'framer-motion';

const SkeletonLoader = ({ count = 1, type = 'default', className = '' }) => {
  const skeletonTypes = {
    default: 'h-4 bg-surface-200 rounded',
    card: 'h-32 bg-surface-200 rounded-lg',
    table: 'h-12 bg-surface-200 rounded',
    metric: 'h-24 bg-surface-200 rounded-lg'
  };

  const skeletonClass = `${skeletonTypes[type]} ${className}`;

  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className={skeletonClass}
        >
          <div className="animate-pulse bg-gradient-to-r from-surface-200 via-surface-300 to-surface-200 h-full rounded"></div>
        </motion.div>
      ))}
    </div>
  );
};

export default SkeletonLoader;