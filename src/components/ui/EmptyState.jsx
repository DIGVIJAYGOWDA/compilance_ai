import { motion } from 'framer-motion';

export default function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      {Icon && (
        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6">
          <Icon className="w-10 h-10 text-blue-400" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      {subtitle && <p className="text-gray-500 text-sm mb-6 max-w-sm">{subtitle}</p>}
      {action && action}
    </motion.div>
  );
}
